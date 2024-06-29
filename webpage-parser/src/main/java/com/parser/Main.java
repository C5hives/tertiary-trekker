package com.parser;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.logging.FileHandler;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.http.HttpHost;
import org.apache.http.auth.AuthScope;
import org.apache.http.auth.UsernamePasswordCredentials;
import org.apache.http.impl.nio.client.HttpAsyncClientBuilder;
import org.apache.http.impl.client.BasicCredentialsProvider;
import org.opensearch.client.RestClient;
import org.opensearch.client.RestClientBuilder;
import org.opensearch.client.json.jackson.JacksonJsonpMapper;
import org.opensearch.client.opensearch.OpenSearchClient;
import org.opensearch.client.opensearch.core.BulkRequest;
import org.opensearch.client.opensearch.core.BulkResponse;
import org.opensearch.client.opensearch.core.bulk.BulkResponseItem;
import org.opensearch.client.transport.OpenSearchTransport;
import org.opensearch.client.transport.rest_client.RestClientTransport;
import com.backend.model.IndexData;

public class Main {
    //Change this DIR to where the parsed data will be within project dir
    static final String CRAWL_JOB_DIR = "C:\\data\\crawlJob_20062024_222512";
    private static Logger logger = Logger.getLogger(Main.class.getName());
    

    public static void main(String[] args) {
        try {
            //Set up logger & file to store logs
            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy_MM_dd");
            String FileName = (new File("").getAbsolutePath()) 
                + "\\webpage-parser\\logs\\"
                + dtf.format(LocalDateTime.now())+"_Parser.log";
            File logFile = new File(FileName);
            logFile.createNewFile();
            logger.setLevel(Level.FINE);
            logger.addHandler(new FileHandler(logFile.toPath().toString()));


            //Build client and connection
            final HttpHost host = new HttpHost("175.156.148.208", 9200, "http");
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

            OpenSearchTransport transport = new RestClientTransport(restClient, new JacksonJsonpMapper());
            OpenSearchClient client = new OpenSearchClient(transport);

            //Parse data
            Parser.iterateAndParseFiles(new File(CRAWL_JOB_DIR), "", "");
            ArrayList<IndexData> data = Parser.getParsedDataAsJSON();

            //Form the bulk request to send to database
            String index = "crawl-data";
            BulkRequest.Builder br = new BulkRequest.Builder();
            int bulkSize = 0;
            for (IndexData indexData : data) {
                String URL = indexData.getUrl().replaceAll("[^a-zA-Z0-9\\s]", "-");
                br.operations(op -> op
                    .index(idx -> idx
                    .index(index)
                    .id(URL)
                    .document(indexData)
                    )
                );

                bulkSize++;
                //Manually send in bulk of 50
                if (bulkSize == 50) {
                    logger.log(Level.INFO, "Sending 50 files");
                    BulkResponse result = client.bulk(br.build());
                    logger.log(Level.INFO, "The time it took in ms: " + result.took());
                    logger.log(Level.INFO, "The amount of item it indexed: " + result.items().size());
                    if (result.errors()) {
                        logger.log(Level.SEVERE, "Bulk had errors");
                        for (BulkResponseItem item: result.items()) {
                            if (item.error() != null) {
                            System.out.println(item.error().reason());
                            }
                        }
                    }
                    br = new BulkRequest.Builder();
                    bulkSize = 0;
                    Thread.sleep(1000);
                }
            }
            //Send the remainder of the data
            logger.log(Level.INFO, "Sending the rest of the files");
            BulkResponse result = client.bulk(br.build());
            logger.log(Level.INFO, "The time it took in ms: " + result.took());
            logger.log(Level.INFO, "The amount of item it indexed: " + result.items().size());
            if (result.errors()) {
                logger.log(Level.SEVERE, "Bulk had errors");
                for (BulkResponseItem item: result.items()) {
                    if (item.error() != null) {
                    System.out.println(item.error().reason());
                    }
                }
            }
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            logger.log(Level.SEVERE, e.getMessage());
        }
    }
}