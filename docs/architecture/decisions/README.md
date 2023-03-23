# Architecture Decision Records

This project uses Architecture Decision Records (ADRs) [described by Michael
Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
to document its architectural decisions.

To generate this readme, install the
[adr-tools](https://github.com/npryce/adr-tools) and run the following command:

```sh
npm run update-adr-index
```

or perform the update manually with

```sh
cd docs/architecture/decisions && adr generate toc -i .adr_README_intro.txt > README.md && npx prettier --write README.md
```

[nnnn-adr-template](./nnnn-adr-template.md) serves as a template for new ADRs
and should be copied to `nnnn-title-of-the-adr.md`, where `nnnn` is the next
unused four digit number.

## Table of Contents
