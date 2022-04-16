FROM node:16-alpine3.15 AS npm-ci

SHELL ["/bin/ash", "-euo", "pipefail", "-c"]

WORKDIR /hue-fireplace

COPY . ./

RUN apk add --no-cache python3~=3.9 make~=4.3 g++~=10.3 && \
    npm ci && \
    npm run build:dist && \
    cp package* dist/src && \
    cd dist/src && \
    npm ci

FROM node:16-alpine3.15

SHELL ["/bin/ash", "-euo", "pipefail", "-c"]

COPY /docker/justcontainer.asc /tmp/justcontainer.asc

RUN apk add --no-cache --virtual /tmp/.gpg gnupg~=2.2 && \
    # Set correct architecture for s6-overlay
    case $(arch) in \
      aarch64) arch=aarch64 ;; \
      armv7l)  arch=armhf ;; \
      x86_64)  arch=amd64 ;; \
      *) echo "Invalid architecture '$(arch)'" && exit 1 ;; \
    esac && \
    # Download just-containers s6-overlay installer and its signature
    wget -nv -O /tmp/s6-installer \
      "https://github.com/just-containers/s6-overlay/releases/download/v2.1.0.2/s6-overlay-$arch-installer" && \
    wget -nv -O /tmp/s6-installer.sig \
      "https://github.com/just-containers/s6-overlay/releases/download/v2.1.0.2/s6-overlay-$arch-installer.sig" && \
    # Import just-containers' public key; use gpgv to validate installer
    gpg --no-default-keyring --keyring /tmp/s6-installer.gpg --import /tmp/justcontainer.asc && \
    gpgv --keyring /tmp/s6-installer.gpg /tmp/s6-installer.sig /tmp/s6-installer && \
    # Execute the installer
    chmod +x /tmp/s6-installer && /tmp/s6-installer / && \
    # Cleanup
    rm /tmp/s6-installer* && \
    apk del /tmp/.gpg

COPY /docker/rootfs/ ./

WORKDIR /hue-fireplace

COPY --from=npm-ci /hue-fireplace/dist/src/. ./

# Restore SHELL to its default
SHELL ["/bin/sh", "-c"]

ENTRYPOINT ["/init"]
