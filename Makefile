PACKAGE_ID := $(shell awk -F"'" '/id:/ {print $$2}' startos/manifest.ts)
# overrides to s9pk.mk must precede the include statement
include s9pk.mk
