from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('questions', '0016_langchainprogress'),
    ]

    operations = [
        migrations.AddField(
            model_name='pet',
            name='pk_wins',
            field=models.IntegerField(default=0, verbose_name='对战胜场(累计)'),
        ),
    ]
