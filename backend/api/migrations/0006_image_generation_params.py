from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_alter_image_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='image',
            name='aspect_ratio',
            field=models.CharField(choices=[('1:1', '1:1'), ('16:9', '16:9'), ('4:3', '4:3'), ('9:16', '9:16'), ('3:2', '3:2')], default='1:1', max_length=10),
        ),
        migrations.AddField(
            model_name='image',
            name='negative_prompt',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='image',
            name='seed',
            field=models.BigIntegerField(blank=True, null=True),
        ),
    ]
