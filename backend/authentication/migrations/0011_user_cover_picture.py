from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0010_user_verification_token_expires_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='cover_picture',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
