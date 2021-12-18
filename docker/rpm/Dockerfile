FROM fedora:latest

ARG NODE_VERSION

RUN dnf install -y rpm-build wget xz tar

WORKDIR /tmp

RUN wget https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.xz && \
    xz --decompress node-${NODE_VERSION}-linux-x64.tar.xz && \
    tar -xf node-${NODE_VERSION}-linux-x64.tar && \
    rm node-${NODE_VERSION}-linux-x64.tar && \
    mv node-${NODE_VERSION}-linux-x64 /usr/share/node && \
    ln -s /usr/share/node/bin/node /usr/bin/node && \
    ln -s /usr/share/node/lib/node_modules/npm/bin/npm-cli.js /usr/bin/npm && \
    ln -s /usr/share/node/lib/node_modules/npm/bin/npx-cli.js /usr/bin/npx

VOLUME [ "/build_root" ]
ADD "entrypoint.sh" /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT /entrypoint.sh