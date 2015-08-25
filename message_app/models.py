from message_app import db

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(120), index=True, unique=False)

    def __repr__(self):
        return '<Message %r>' % (self.message)