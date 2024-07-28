import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;

@SpringBootTest(classes = com.backend.Application.class, 
webEnvironment = WebEnvironment.RANDOM_PORT)
class backendTest {

	@Test
	public void contextLoads() {
	}

	@Autowired
	private TestRestTemplate restTemplate;

	//Test for a simple String return from server
	@Test
	public void stringOutputTest() {
		String body = this.restTemplate.getForObject("/api/test", String.class);
		assertEquals("Spring boot is working and test returns this string", body);
	}

	//Test for bad path that 404 status code and error message is returned
	@Test 
	public void errorTest() {
		String response = this.restTemplate.getForObject("/bad/path", String.class);
		assertTrue(response.contains("error") & response.contains("404"));
	}

	@Test 
	public void searchAPITest() {
		String body = this.restTemplate.getForObject("/api/search?term=ntu", String.class);
		assertNotEquals(null, body);	
	}

	@Test 
	public void searchMLTAPITest() {
		String body = this.restTemplate.getForObject("/api/MLTsearch?id=ntu", String.class);
		assertNotEquals(null, body);
	}

	@Test 
	public void badsearchAPITest() {
		String response = this.restTemplate.getForObject("/api/search", String.class);
		assertTrue(response.contains("400"));
	}

	@Test 
	public void badsearchMLTAPITest() {
		String response = this.restTemplate.getForObject("/api/MLTsearch", String.class);
		assertTrue(response.contains("400"));
	}

}

    