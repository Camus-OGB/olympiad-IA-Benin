"""
Service d'envoi d'emails
Utilise smtplib (stdlib Python) — aucune dépendance externe
"""
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.core.config import settings
import asyncio
import logging

logger = logging.getLogger(__name__)


def _send_email_sync(email_to: str, subject: str, html_content: str, text_content: str = None):
    """Envoi synchrone via smtplib (stdlib) — exécuté dans un thread"""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    msg["To"] = email_to

    if text_content:
        msg.attach(MIMEText(text_content, "plain", "utf-8"))
    msg.attach(MIMEText(html_content, "html", "utf-8"))

    context = ssl.create_default_context()

    if settings.MAIL_SSL_TLS:
        # Port 465 — SSL direct
        with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=context) as server:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAILS_FROM_EMAIL, email_to, msg.as_string())
    else:
        # Port 587 — STARTTLS
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo()
            server.starttls(context=context)
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAILS_FROM_EMAIL, email_to, msg.as_string())


async def send_email(
    email_to: str,
    subject: str,
    html_content: str,
    text_content: str = None
):
    """Envoie un email (async — délégué à un thread pour ne pas bloquer FastAPI)"""
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None, _send_email_sync, email_to, subject, html_content, text_content
        )
        logger.info(f"Email envoyé à {email_to}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Erreur envoi email à {email_to}: {str(e)}")
        return False


async def send_verification_email(email: str, otp_code: str):
    """
    Envoie un email de vérification avec code OTP - Section 3.1
    """
    subject = "Vérifiez votre email - Olympiades IA Bénin"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #1e3a8a 0%, #10b981 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
            .otp-code {{ font-size: 32px; font-weight: bold; color: #1e3a8a; text-align: center; padding: 20px; background: white; border-radius: 10px; margin: 20px 0; letter-spacing: 8px; }}
            .button {{ display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎓 Olympiades IA Bénin</h1>
                <p>Vérification de votre compte</p>
            </div>
            <div class="content">
                <h2>Bienvenue !</h2>
                <p>Merci de vous être inscrit aux Olympiades d'Intelligence Artificielle du Bénin.</p>
                <p>Pour activer votre compte, veuillez utiliser le code de vérification ci-dessous :</p>

                <div class="otp-code">{otp_code}</div>

                <p>Ce code est valide pendant <strong>15 minutes</strong>.</p>
                <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p><strong>Prochaines étapes :</strong></p>
                    <ul>
                        <li>Complétez votre profil</li>
                        <li>Passez le QCM de présélection</li>
                        <li>Suivez votre progression</li>
                    </ul>
                </div>
            </div>
            <div class="footer">
                <p>© 2026 Olympiades IA Bénin. Tous droits réservés.</p>
                <p>Cet email a été envoyé à {email}</p>
            </div>
        </div>
    </body>
    </html>
    """

    return await send_email(email, subject, html_content)


async def send_password_reset_email(email: str, otp_code: str):
    """
    Envoie un email de réinitialisation de mot de passe
    """
    subject = "Réinitialisation de mot de passe - Olympiades IA Bénin"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #dc2626 0%, #f59e0b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
            .otp-code {{ font-size: 32px; font-weight: bold; color: #dc2626; text-align: center; padding: 20px; background: white; border-radius: 10px; margin: 20px 0; letter-spacing: 8px; }}
            .warning {{ background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }}
            .footer {{ text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Réinitialisation de mot de passe</h1>
            </div>
            <div class="content">
                <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                <p>Utilisez le code ci-dessous pour créer un nouveau mot de passe :</p>

                <div class="otp-code">{otp_code}</div>

                <p>Ce code est valide pendant <strong>15 minutes</strong>.</p>

                <div class="warning">
                    <strong>⚠️ Attention :</strong><br>
                    Si vous n'avez pas demandé cette réinitialisation, ignorez cet email et votre mot de passe restera inchangé.
                </div>
            </div>
            <div class="footer">
                <p>© 2026 Olympiades IA Bénin. Tous droits réservés.</p>
                <p>Cet email a été envoyé à {email}</p>
            </div>
        </div>
    </body>
    </html>
    """

    return await send_email(email, subject, html_content)


async def send_welcome_email(email: str, first_name: str):
    """
    Envoie un email de bienvenue après vérification
    """
    subject = "Bienvenue aux Olympiades IA Bénin 2026 !"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #1e3a8a 0%, #10b981 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
            .cta-button {{ display: inline-block; padding: 15px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }}
            .timeline {{ background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }}
            .timeline-item {{ margin: 15px 0; padding-left: 25px; border-left: 3px solid #10b981; }}
            .footer {{ text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Bienvenue {first_name} !</h1>
                <p>Votre compte est activé</p>
            </div>
            <div class="content">
                <h2>Félicitations !</h2>
                <p>Votre inscription aux Olympiades d'Intelligence Artificielle du Bénin 2026 est confirmée.</p>

                <div class="timeline">
                    <h3>📅 Prochaines étapes :</h3>
                    <div class="timeline-item">
                        <strong>1. Complétez votre profil</strong><br>
                        Ajoutez vos informations personnelles et scolaires
                    </div>
                    <div class="timeline-item">
                        <strong>2. Passez le QCM</strong><br>
                        Test de logique et raisonnement chronométré
                    </div>
                    <div class="timeline-item">
                        <strong>3. Suivez votre progression</strong><br>
                        Consultez votre tableau de bord régulièrement
                    </div>
                </div>

                <div style="text-align: center;">
                    <a href="{settings.FRONTEND_URL}/candidat/dashboard" class="cta-button">
                        Accéder à mon espace
                    </a>
                </div>

                <p style="margin-top: 30px; color: #6b7280;">
                    <strong>Besoin d'aide ?</strong><br>
                    Consultez notre <a href="{settings.FRONTEND_URL}/faq">FAQ</a> ou contactez-nous.
                </p>
            </div>
            <div class="footer">
                <p>© 2026 Olympiades IA Bénin. Tous droits réservés.</p>
                <p>Cet email a été envoyé à {email}</p>
            </div>
        </div>
    </body>
    </html>
    """

    return await send_email(email, subject, html_content)


async def send_admin_notification(email: str, subject: str, message: str):
    """
    Envoie une notification aux administrateurs
    """
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;">
        <h2>Notification Admin - Olympiades IA Bénin</h2>
        <p>{message}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
            Cet email a été généré automatiquement par la plateforme.
        </p>
    </body>
    </html>
    """

    return await send_email(email, subject, html_content)


async def send_notification_email(email: str, name: str, subject: str, message: str):
    """
    Envoie une notification à un candidat
    """
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }}
            .content {{
                background: white;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
            }}
            .message {{
                background: #f3f4f6;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #667eea;
            }}
            .footer {{
                text-align: center;
                padding: 20px;
                color: #6b7280;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Olympiades IA Bénin</h1>
            </div>
            <div class="content">
                <p>Bonjour {name},</p>
                <div class="message">
                    {message}
                </div>
                <p>Consultez votre tableau de bord pour plus de détails :</p>
                <p style="text-align: center;">
                    <a href="{settings.FRONTEND_URL}/candidat/dashboard"
                       style="display: inline-block; background: #667eea; color: white; padding: 12px 30px;
                              text-decoration: none; border-radius: 6px; margin: 10px 0;">
                        Voir mon tableau de bord
                    </a>
                </p>
            </div>
            <div class="footer">
                <p>© 2026 Olympiades IA Bénin. Tous droits réservés.</p>
                <p>Cet email a été envoyé à {email}</p>
            </div>
        </div>
    </body>
    </html>
    """

    return await send_email(email, subject, html_content)
