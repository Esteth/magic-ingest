FROM debian
RUN apt-get update && apt-get -y install cron
RUN touch /var/log/cron.log
ADD crontab /etc/cron.d/magic
RUN chmod 0644 /etc/cron.d/magic
CMD ["cron", "-f", "-l", "0"]