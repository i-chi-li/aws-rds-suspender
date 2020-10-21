FROM docker

ENV PATH=/root/go/bin:$PATH \
    TZ=Asia/Tokyo

RUN apk add --update --no-cache \
    nodejs~=12 \
    npm \
    openjdk11 \
    go \
    git \
    python3 \
    python3-dev \
    py3-pip \
    groff \
    jq \
    curl \
    tzdata \
 && go get -u github.com/awslabs/amazon-ecr-credential-helper/ecr-login/cli/docker-credential-ecr-login \
 && pip install --upgrade awscli aws-sam-cli
