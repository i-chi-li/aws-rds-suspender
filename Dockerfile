#
# CDK Execution Environment Dockerfile
#
# The "--privileged" option is required for docker run.
#

FROM amazonlinux:2

CMD ["/bin/bash"]
VOLUME ["/var/lib/docker"]

ENV PATH=/root/go/bin:$PATH \
    TZ=Asia/Tokyo \
    LANG=en_US.utf8

SHELL ["/bin/bash", "-c"]

RUN \
  set -eux; \
  yum -q -y update; \
  yum -q -y install \
    java-11-amazon-corretto-headless \
    git \
    tar \
    unzip \
    groff \
    jq \
    vim \
    # for docker
    btrfs-progs \
    e2fsprogs \
    openssl \
    ; \
  # Docker
  amazon-linux-extras install docker; \
  # AWS CLI
  curl --silent "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"; \
  unzip -q awscliv2.zip; \
  ./aws/install; \
  rm -rf aws awscliv2.zip; \
  # Node Version Manager
  touch ~/.bashrc; \
  set +x; \
  curl --silent -o- "https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh" | bash; \
  . ~/.nvm/nvm.sh; \
  # Node v14
  nvm install 14; \
  npm install -g node-inspect; \
  nvm cache clear; \
  set -x; \
  # Clean Yum Cache
  rm -rf /var/cache/yum; \
  yum clean all;
