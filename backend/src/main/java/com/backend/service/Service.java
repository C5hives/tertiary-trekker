package com.backend.service;


import java.io.IOException;
import java.util.Arrays;
import org.opensearch.client.opensearch._types.query_dsl.MatchQuery;
import org.opensearch.client.opensearch._types.query_dsl.NeuralQuery;
import org.opensearch.client.opensearch._types.query_dsl.Query;
import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.apache.http.impl.nio.client.HttpAsyncClientBuilder;
import org.opensearch.client.RestClient;
import org.opensearch.client.RestClientBuilder;
import org.opensearch.client.json.jackson.JacksonJsonpMapper;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch._types.FieldValue;
import org.opensearch.client.opensearch.core.SearchRequest;
import org.opensearch.client.opensearch.core.SearchResponse;
import org.opensearch.client.transport.OpenSearchTransport;
import org.opensearch.client.transport.rest_client.RestClientTransport;

import com.backend.model.IndexData;

public class Service {

    public static SearchResponse<IndexData> searchTerm(String term) throws IOException {
        // System.setProperty("javax.net.ssl.trustStore", "C:\\Users\\jewit\\Downloads\\cacerts");
        // System.setProperty("javax.net.ssl.trustStorePassword", "changeit");

        final HttpHost host = new HttpHost("175.156.143.77", 9200, "http");
        final BasicCredentialsProvider credentialsProvider = new BasicCredentialsProvider();
        credentialsProvider.setCredentials(new AuthScope(host), new UsernamePasswordCredentials("server", "j#52!vB-1D<!"));
        
        //Initialize the client with SSL and TLS enabled
        final RestClient restClient = RestClient.builder(host).
        setHttpClientConfigCallback(new RestClientBuilder.HttpClientConfigCallback() {
            @Override
            public HttpAsyncClientBuilder customizeHttpClient(HttpAsyncClientBuilder httpClientBuilder) {
            return httpClientBuilder.setDefaultCredentialsProvider(credentialsProvider);
            }
        }).build();

        final OpenSearchTransport transport = new RestClientTransport(restClient, new JacksonJsonpMapper());
        final OpenSearchClient client = new OpenSearchClient(transport);

        Query searchQuery = Query.of(
                h -> h.hybrid(
                    q -> q.queries( Arrays.asList(
                        new MatchQuery.Builder().field("content").query(FieldValue.of(term)).build().toQuery(),
                        new MatchQuery.Builder().field("URL").query(FieldValue.of(term)).build().toQuery(),
                        new MatchQuery.Builder().field("title").query(FieldValue.of(term)).build().toQuery(),
                        new NeuralQuery.Builder().field("content_embedding").queryText(term).modelId("vJqkTpABdExxECYqf0PV").k(100).build().toQuery(),
                        new NeuralQuery.Builder().field("title_embedding").queryText(term).modelId("vJqkTpABdExxECYqf0PV").k(100).build().toQuery())
                    )
                )
            );

        SearchRequest searchRequest = new SearchRequest.Builder().query(searchQuery).terminateAfter((long) 100).build();
        SearchResponse<IndexData> searchResponse = client
            .search(searchRequest, IndexData.class);

        for (var hit : searchResponse.hits().hits()) {
            System.out.printf("Found %s with score %s", hit.source().toString(), hit.score());
            System.out.println();
        }

        return searchResponse;
    }
    
}

