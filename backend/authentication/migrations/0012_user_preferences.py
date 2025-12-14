from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0011_user_cover_picture'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='preferences',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
