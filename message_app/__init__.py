from flask import Flask, url_for
from flask.ext.sqlalchemy import SQLAlchemy
import os

message_app = Flask(__name__)
message_app.config.from_object('config')
db = SQLAlchemy(message_app)

# Determines the destination of the build. Only usefull if you're using Frozen-Flask
message_app.config['FREEZER_DESTINATION'] = os.path.dirname(os.path.abspath(__file__))+'/../build'

# Function to easily find your assets
# In your template use <link rel=stylesheet href="{{ static('filename') }}">
message_app.jinja_env.globals['static'] = (
    lambda filename: url_for('static', filename = filename)
)

from message_app import views, models
