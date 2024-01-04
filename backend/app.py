from flask_cors import CORS
from flask import request, jsonify
import flask
import json
from bill import calculate_bill
from encoders import CustomJSONProvider




def load_session():
    global session
    try:
        with open("session.json", "r") as f:
            session = json.load(f)
    except:
        pass

def save_session():
    with open("session.json", "w") as f:
        json.dump(session, f, indent=4)

session = {}
load_session()

# create flask route
app = flask.Flask(__name__)

CORS(app)






app.json = CustomJSONProvider(app)


@app.route('/form', methods=['GET'])
def home():
    # serve a static html file
    return app.send_static_file('form.html')


@app.route('/api/v1/clients', methods=['POST'])
def api_clients():
    if request.method == 'POST':
        data = request.get_json()
        session["clients"] = data
        save_session()
        return jsonify(data)


@app.route('/api/v1/clients', methods=['GET'])
def get_clients():
    if request.method == 'GET':
        print(session)
        return jsonify(session["clients"])


@app.route('/api/v1/items', methods=['POST'])
def set_bill():
    if request.method == 'POST':
        data = request.get_json()
        session["bill"] = data
        save_session()
        print(data)
        return jsonify(data)


@app.route('/api/v1/items', methods=['GET'])
def get_bill():
    if request.method == 'GET':
        return jsonify(session["bill"])


@app.route('/api/v1/rules', methods=['POST'])
def set_rules():
    if request.method == 'POST':
        data = request.get_json()
        session["rules"] = data
        save_session()
        return jsonify(data)
    
@app.route('/api/v1/tip', methods=['POST'])
def set_gorjeta():
    if request.method == 'POST':
        data = request.get_json()
        session["gorjeta"] = data
        save_session()
        return jsonify(data)


@app.route('/api/v1/rules', methods=['GET'])
def get_rules():
    if request.method == 'GET':
        return jsonify(session["rules"])


@app.route('/api/v1/modes', methods=['GET'])
def get_modes():
    if request.method == 'GET':
        return jsonify(modes)


@app.route("/api/v1/resume", methods=['GET'])
def get_resume():
    if request.method == 'GET':
        clients = session["clients"]
        bill = session["bill"]
        rules = session["rules"]
        total_informado = 0
        gorjeta = float(session["gorjeta"]["tip"])       
        return calculate_bill(clients, bill, rules, total_informado, gorjeta)


app.run(host='0.0.0.0')
