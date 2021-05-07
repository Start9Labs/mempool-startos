VERSION_TAG := $(shell ./get-tag.sh)
VERSION := $(shell ./get-tag.sh | cut -c 2-)
MAJOR := $(shell echo $(VERSION) | cut -d. -f1)
MINOR := $(shell echo $(VERSION) | cut -d. -f2)
PATCH := $(shell echo $(VERSION) | cut -d. -f3)
BUILD := $(shell echo $(VERSION) | cut -d. -f4)
S9_VERSION := $(shell echo $(MAJOR).$(MINOR).$(PATCH))
MEMPOOL_SRC := $(shell find ./mempool)
MEMPOOL_GIT_REF := $(shell cat .git/modules/mempool/HEAD)
MEMPOOL_GIT_FILE := $(addprefix .git/modules/mempool/,$(if $(filter ref:%,$(MEMPOOL_GIT_REF)),$(lastword $(MEMPOOL_GIT_REF)),HEAD))

.DELETE_ON_ERROR:

all: mempool.s9pk

install: mempool.s9pk
	appmgr install mempool.s9pk

mempool.s9pk: manifest.yaml config_spec.yaml config_rules.yaml image.tar instructions.md
	appmgr -vv pack $(shell pwd) -o mempool.s9pk
	appmgr -vv verify mempool.s9pk

instructions.md: README.md
	cp README.md instructions.md

image.tar: Dockerfile docker_entrypoint.sh $(MEMPOOL_GIT_FILE) Dockerfile
	DOCKER_CLI_EXPERIMENTAL=enabled docker buildx build --tag start9/mempool --platform=linux/arm/v7 -o type=docker,dest=image.tar -f ./Dockerfile .

manifest-version: $(MEMPOOL_GIT_FILE)
	$(info TAG VERSION is $(VERSION))
	$(info S9 VERSION is $(S9_VERSION))
	yq eval -i ".version = \"$(S9_VERSION)\"" manifest.yaml
	yq eval -i ".release-notes = \"https://github.com/mempool/mempool/releases/tag/$(VERSION_TAG)\" manifest.yaml
