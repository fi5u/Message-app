from flask import render_template
from Message App import Message App

@Message App.route('/')
def index():
    return render_template('index.html')
