package org.web.storage;

public record StorageObjectMetadata(long sizeBytes, String contentType, String etag) {
}
