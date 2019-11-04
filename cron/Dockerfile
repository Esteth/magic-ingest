FROM alpine
RUN apk add --no-cache wget
COPY crontab /etc/crontabs/root
CMD ["crond", "-f", "-d", "8"]