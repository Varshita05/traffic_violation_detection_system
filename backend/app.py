from dotenv import load_dotenv
from flask import Flask, request, jsonify
from database.connection_pool import get_db_connection
from fpdf import FPDF
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (JWTManager, create_access_token, jwt_required, get_jwt_identity)
from video_service import register_socketio_events, start_video, db_work
import os

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

socketio = SocketIO(app, cors_allowed_origins=("http://localhost:5173", "https://traffic-violation-detection-system-kappa.vercel.app/"), async_mode='threading')

# method to run sql queries
def run_query(query, params=None, fetch=True, commit=False):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(query, params or ())
        if commit:
            connection.commit()
            return True
        if fetch:
            return cursor.fetchall()
    except Exception as e:
        print(f"Database error: {e}")
        return None
    finally:
        cursor.close()
        connection.close()

# --------- LOGIN API --------- #

@app.route('/api/login', methods=['POST'])

def login():
    data = request.get_json()
    username = data.get('username') or ''
    password = data.get('password') or ''
    role = data.get('role') or 'Commoner'

    if not username or not password:
        return jsonify({"status": "error", "message": "Username and password are required"}), 400
    
    users = run_query("SELECT * FROM users WHERE username = %s", params=(username,))
    if not users:
        return jsonify({"status": "error", "message": "Invalid username or password"}), 400
    
    hashed_password = users[0]['password']
    if not bcrypt.check_password_hash(hashed_password, password):
        return jsonify({"status": "error", "message": "Invalid username or password"}), 400

    if users[0]['role']!= role:
        return jsonify({"status": "error", "message": "Invalid role"}), 400
    
    if users[0]['status'] != 'Active':
        return jsonify({"status": "error", "message": "User Inactive"}), 400
    
    print(f"User {username} authenticated successfully with role {role}")
    
    access_token = create_access_token(identity={"username": username, "role": role})
    print("try",access_token)
    return jsonify({"access_token": access_token}), 200

# --------- DASHBOARD API --------- #

@app.route('/api/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    current_user = get_jwt_identity()
    return jsonify({"status": "success", "message": f"Welcome {current_user['username']}! Your role is {current_user['role']}."})

# --------- USERS API --------- #

# get user details
@app.route('/api/users', methods=['GET'])

def get_users():
    users = run_query("SELECT * FROM users")
    if users is None:
        return jsonify({"status": "error", "message": "Failed to fetch users"}), 500
    return jsonify(users)

# add new user
@app.route('/api/users', methods=['POST'])

def add_user():
    data = request.get_json()
    hashed_password = bcrypt.generate_password_hash(data['password'].encode('utf-8'))
    query = "INSERT INTO users (username, password, role, status) VALUES (%s, %s, %s, %s)"
    run_query(query=query, params=(data['username'], hashed_password, data['role'], data['status']),fetch=False, commit=True)
    return jsonify({"status": "user added successfully"})

# update user details
@app.route('/api/users/<int:id>', methods=['PUT'])

def update_user(id):
    data = request.get_json()

    try:
        password = data.get('password', None)
        
        if password and password.strip() != "":
            hashed_password = bcrypt.generate_password_hash(
                password.encode('utf-8')
            ).decode('utf-8')

            query = """
                UPDATE users 
                SET username=%s, password=%s, role=%s, status=%s 
                WHERE id=%s
            """
            params = (
                data.get('username'),
                hashed_password,
                data.get('role'),
                data.get('status'),
                id
            )

        else:
            query = """
                UPDATE users 
                SET username=%s, role=%s, status=%s 
                WHERE id=%s
            """
            params = (
                data.get('username'),
                data.get('role'),
                data.get('status'),
                id
            )

        run_query(query=query, params=params, fetch=False, commit=True)

        return jsonify({"status": "user updated successfully"})

    except Exception as e:
        print("UPDATE ERROR:", e)
        return jsonify({"error": str(e)}), 500

# delete user
@app.route('/api/users/<int:id>', methods=['DELETE'])

def delete_user(id):
    query = "DELETE FROM users WHERE id=%s"
    run_query(query=query, params=(id,), fetch=False, commit=True)
    return jsonify({"status": "user deleted successfully"})

# --------------- ANALYTICS API --------------- #

@app.route('/api/analytics', methods=['GET'])

def analytics():
    query = """
    SELECT violation_type, COUNT(*) AS count
    FROM violations
    GROUP BY violation_type
    ORDER BY count DESC    
    """
    data = run_query(query)
    return jsonify(data)

# ------------------- VIOLATIONS API ------------------ #

@app.route('/api/violations', methods=['GET'])

def get_violations():
    query = "SELECT * FROM violations ORDER BY timestamp DESC LIMIT 100"
    data = run_query(query)
    return jsonify(data)

@app.route("/api/violations/<int:id>/resolve", methods=["PUT"])

def resolve_violation(id):
    try:
        run_query("UPDATE violations SET status='Resolved' WHERE id=%s", (id,), fetch=False, commit=True)
        return jsonify({"message": "Resolved"}), 200
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Failed"}), 500

# -------------------REPORT API ------------------ #

@app.route('/api/reports', methods=['GET'])

def get_reports():
    from_date = request.args.get('from')
    to_date = request.args.get('to')
    violation = request.args.get('violation')

    query = "SELECT * FROM violations WHERE 1=1"
    params = []

    if from_date and to_date:
        query += " AND timestamp BETWEEN %s AND %s"
        params.append(f"{from_date} 00:00:00")
        params.append(f"{to_date} 23:59:59")

    if violation and violation != "All":
        query += " AND violation_type = %s"
        params.append(violation)

    print("Parameters:", params)

    data = run_query(query, params=params)
    return jsonify(data)

# report pdf generation

@app.route('/api/reports/pdf', methods=['GET'])

def generate_pdf_report():
    reports = run_query("SELECT * FROM violations ORDER BY timestamp DESC LIMIT 100")
    
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="Traffic Violation Report", ln=True, align='C')
    
    headers = ["ID", "Vehicle Number", "Violation Type", "Timestamp"]
    for header in headers:
        pdf.cell(48, 10, txt=header, border=1)
    pdf.ln()

    if not reports:
        return jsonify({"status": "error", "message": "Failed to fetch reports"}), 500

    for report in reports:
        pdf.cell(48, 10, txt=str(report['id']), border=1)
        pdf.cell(48, 10, txt=report['vehicle_number'], border=1)
        pdf.cell(48, 10, txt=report['violation_type'], border=1)
        pdf.cell(48, 10, txt=str(report['timestamp']), border=1)
        pdf.ln()

    pdf_output = pdf.output(dest='S').encode('latin-1')
    return pdf_output, 200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="violation_report.pdf"'
    }

# start the application
if __name__ == '__main__':
    #register socketio events
    register_socketio_events(socketio)

    # start video processing
    start_video(socketio)
    
    socketio.run(app, port=5000, debug=False)
    socketio.start_background_task(db_work)