FROM google/cloud-sdk:slim
ENV CLOUDSDK_CONFIG=/tmp/config
ENV HOME=/tmp
RUN apt-get update && apt-get upgrade -y && apt-get -y install \
  kubectl \
  && rm -rf /var/lib/apt/lists/*

ADD ./backup.sh .

CMD ["./backup.sh"]
