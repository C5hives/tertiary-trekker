package com.backend.service;


import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;

import org.opensearch.client.opensearch._types.query_dsl.Like;
import org.opensearch.client.opensearch._types.query_dsl.MatchQuery;
import org.opensearch.client.opensearch._types.query_dsl.MoreLikeThisQuery;
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
import com.backend.model.queryData;


public class Service {

    private static String server_ip =  "175.156.233.42";

    private static int server_port = 9200;

    public static ArrayList<queryData> searchTerm(String term) throws IOException {

        final HttpHost host = new HttpHost(server_ip, server_port , "http");
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

        SearchRequest searchRequest = new SearchRequest.Builder().query(searchQuery).terminateAfter((long) 1000).size(500).build();
        SearchResponse<IndexData> searchResponse = client
            .search(searchRequest, IndexData.class);

        ArrayList<queryData> result = new ArrayList<>();
        int count = 0;
        for (var hit : searchResponse.hits().hits()) { 
            queryData temp = new queryData();
            temp.setTitle(hit.source().getTitle());
            temp.setCategory(hit.source().getCategory());
            temp.setContent(hit.source().getContent());
            temp.setURL(hit.source().getUrl());
            temp.setID(hit.source().getUrl().replaceAll("[^a-zA-Z0-9\\s]", "-"));
            result.add(temp);  
            count++;            
        }

        System.out.println(result);
        System.out.println(count);
        return result;
    }

    public static ArrayList<queryData> searchMLTTerm(String term) throws IOException {

        final HttpHost host = new HttpHost(server_ip, server_port , "http");
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

        MoreLikeThisQuery moreLikeThisQuery = MoreLikeThisQuery.of(m -> m.minTermFreq(1)
            .maxQueryTerms(15)
            .fields("title", "content","URL","category")
            .like(new Like.Builder().text(term).build()));

        Query searchQuery = Query.of(
                q -> q.moreLikeThis(moreLikeThisQuery)
            );

        SearchRequest searchRequest = new SearchRequest.Builder().query(searchQuery).terminateAfter((long) 1000).size(10).build();
        SearchResponse<IndexData> searchResponse = client
            .search(searchRequest, IndexData.class);

        ArrayList<queryData> result = new ArrayList<>();
        int count = 0;
        for (var hit : searchResponse.hits().hits()) { 
            queryData temp = new queryData();
            temp.setTitle(hit.source().getTitle());
            temp.setCategory(hit.source().getCategory());
            temp.setContent(hit.source().getContent());
            temp.setURL(hit.source().getUrl());
            temp.setID(hit.source().getUrl().replaceAll("[^a-zA-Z0-9\\s]", "-"));
            result.add(temp);  
            count++;            
        }

        System.out.println(result);
        System.out.println(count);
        return result;
    }
    
}

