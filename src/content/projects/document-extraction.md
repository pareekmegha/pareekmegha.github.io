---
title: Document Information Extraction Pipeline
question: How do you turn a pile of documents into a clean table?
summary: An end-to-end ETL pipeline that converts unstructured documents into structured datasets, with 92–95% extraction accuracy across 100+ documents.
kind: Project
hue: sky
art: pages
order: 7
lens:
  engineering: 2
  ai: 4
tags: [Pipeline, ETL]
stack: [Python, ETL, Schema validation, Chunking]
links:
  - label: Code on GitHub
    href: https://github.com/pareekmegha/matrimonial-etl-pipeline
stats:
  - value: 92–95%
    label: extraction accuracy
  - value: 100+
    label: documents processed
---

## What I built

An end-to-end pipeline that takes unstructured documents and produces structured datasets. Documents are split into chunks, the fields are extracted, and every record is checked against a schema before it is accepted.
