from flask import render_template, redirect
from message_app import message_app
from .forms import LoginForm

@message_app.route('/')
def index():
    return render_template('index.html',
        title='home')

@message_app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        if form.username.data == 'admin' and form.password.data == '123':
            return redirect('/admin')
    return render_template('login.html', title='login', form=form)

@message_app.route('/admin')
def admin():
    return render_template('admin.html',
        title='admin')

@message_app.route('/about')
def about():
    return render_template('about.html',
        title='about')