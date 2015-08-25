from flask import render_template, redirect, session
from message_app import message_app
from .forms import LoginForm

@message_app.route('/')
def index():
    return render_template('index.html',
        title='home')

@message_app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if session['authenticated'] == True:
        return redirect('/admin')
    if form.validate_on_submit():
        if form.username.data == 'admin' and form.password.data == '123':
            session['authenticated'] = True
            return redirect('/admin')
    return render_template('login.html', title='login', form=form)

@message_app.route('/admin')
def admin():
    if session['authenticated'] == False:
        return redirect('/login')
    return render_template('admin.html',
        title='admin')

@message_app.route('/logout')
def logout():
    session['authenticated'] = False
    return redirect('/login')

@message_app.route('/about')
def about():
    return render_template('about.html',
        title='about')

message_app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'