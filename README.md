# QHUNT SOCKET

## Run

```bash
# install
pnpm install

# run
pnpm dev

# build
pnpm build

# start
pnpm start
```

## Docker

You can create bash script from this

```bash
sha=$(git rev-parse HEAD)
tag="ghcr.io/okyaneka/qhunt-socket:${sha}"
docker build -t $tag .
docker push $tag
echo "$tag success"
```
