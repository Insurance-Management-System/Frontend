package com.insurance.client;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.insurance.custom_exception.InvalidRequestException;
import com.insurance.dtos.DocumentRecord;

@Component
public class DocumentServiceClient {

	@Value("${document.service.url}")
	private String documentServiceUrl;

	public List<String> verifiedDocumentTypeNames(String referenceType, String referenceId) {
		return latestPerType(fetch(referenceType, referenceId)).values().stream()
				.filter(doc -> "VERIFIED".equalsIgnoreCase(doc.verificationStatus()))
				.map(doc -> doc.documentType().toLowerCase())
				.toList();
	}

	public List<String> uploadedDocumentTypeNames(String referenceType, String referenceId) {
		return latestPerType(fetch(referenceType, referenceId)).keySet().stream().toList();
	}

	public List<DocumentRecord> listByReference(String referenceType, String referenceId) {
		DocumentRecord[] docs = fetch(referenceType, referenceId);
		return docs == null ? List.of() : List.of(docs);
	}

	public List<DocumentRecord> listAll() {
		try {
			DocumentRecord[] docs = RestClient.create(documentServiceUrl).get()
					.uri("")
					.retrieve()
					.body(DocumentRecord[].class);
			return docs == null ? List.of() : List.of(docs);
		} catch (RuntimeException ex) {
			throw new InvalidRequestException("Document service is unavailable. Please try again.");
		}
	}

	private DocumentRecord[] fetch(String referenceType, String referenceId) {
		try {
			return RestClient.create(documentServiceUrl).get()
					.uri("/reference/{referenceType}/{referenceId}", referenceType, referenceId)
					.retrieve()
					.body(DocumentRecord[].class);
		} catch (RuntimeException ex) {
			throw new InvalidRequestException("Document service is unavailable. Please try again after document verification is available.");
		}
	}

	private Map<String, DocumentRecord> latestPerType(DocumentRecord[] docs) {
		Map<String, DocumentRecord> latest = new LinkedHashMap<>();
		for (DocumentRecord doc : docs == null ? new DocumentRecord[0] : docs) {
			latest.putIfAbsent(doc.documentType().toLowerCase(), doc);
		}
		return latest;
	}
}
