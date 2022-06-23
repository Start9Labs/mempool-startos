EMVER := $(shell yq e ".version" manifest.yaml)
MEMPOOL_SRC := $(shell find ./mempool)
MEMPOOL_GIT_REF := $(shell cat .git/modules/mempool/HEAD)
MEMPOOL_GIT_FILE := $(addprefix .git/modules/mempool/,$(if $(filter ref:%,$(MEMPOOL_GIT_REF)),$(lastword $(MEMPOOL_GIT_REF)),HEAD))
S9PK_PATH=$(shell find . -name mempool.s9pk -print)

.DELETE_ON_ERROR:

all: verify

verify:  mempool.s9pk $(S9PK_PATH)
	embassy-sdk verify s9pk $(S9PK_PATH)

install: mempool.s9pk
	embassy-cli package install mempool.s9pk

mempool.s9pk: manifest.yaml assets/* image.tar docs/instructions.md scripts/embassy.js 
	embassy-sdk pack

instructions.md: README.md
	cp README.md instructions.md

image.tar: Dockerfile docker_entrypoint.sh assets/utils/* $(MEMPOOL_GIT_FILE)
	DOCKER_CLI_EXPERIMENTAL=enabled docker buildx build --tag start9/mempool/main:${EMVER} --platform=linux/arm64/v8 -o type=docker,dest=image.tar -f ./Dockerfile .

clean:
	rm -f mempool.s9pk
	rm -f image.tar

scripts/embassy.js: scripts/**/*.ts
	deno cache --reload scripts/embassy.ts
	deno bundle scripts/embassy.ts scripts/embassy.js
