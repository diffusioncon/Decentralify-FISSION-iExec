# It's Netlify. But decentralized!

https://decentralify.runfission.com

### Test the docker container locally

```
$ cd build-image
$ mkdir -p iexec_in iexec_out
$ sh ./test/iexec-test.sh
```

## Inspiration

There are incredible automation tools in web2 world that allow you to create continuous integration and deployment pipelines for your applications. We thought: why not creating a decentralized pipeline so that the application build process and its hosting will rely only on decentralized services?

## What it does

Takes a GitHub repo with an app (VuePress, Hugo, Gatsby, etc), builds it on iExec, uploads the assets to IPFS and provides a simple domain via FISSION.

## How we built it

We took the Netlify [build-image](https://github.com/netlify/build-image) and added functionality to be compatible with iExec and `ipfs-deploy`.

## Challenges we ran into

- iExec onboarding is not easy.
- iExec Kovan marketplace can be harsh at times (e.g. no available workers for XS tasks).

## Accomplishments that we're proud of

Building a working build and deployment pipeline with has out-of-the-box support for dozens of static site builders using mostly web3 and some web2 technologies.

## What we learned

- It's technically possible to build using web3 stack!
- It's still quite challenging to use decentralized compute platforms like iExec as the onboarding is complicated and there's not enough workers in the pool.
- Infura IPFS gateway is not stable.
- There's still lack of tooling and documentation for web3 services.

## What's next for Decentralify

We want to continue refining and deploying it to the iExec marketplace once it's ready. We'll also be talking to FISSION and see if we can integrate it with their toolchain.