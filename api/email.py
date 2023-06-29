from flask_mail import Message

from config import BaseConfig


# https://stackoverflow.com/questions/72576024/smtplib-smtpauthenticationerror-535-b5-7-8-username-and-password-not-accepte

from . import mail 

def send_email(to, subject, template):
  msg = Message(
    subject,
    recipients=[to],
    html=template,
    sender=BaseConfig.MAIL_DEFAULT_SENDER
  )
  mail.send(msg)