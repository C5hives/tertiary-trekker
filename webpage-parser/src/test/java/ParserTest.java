import static org.junit.Assert.assertEquals;

import java.io.File;
import java.util.ArrayList;

import org.junit.Test;

import com.parser.Parser;
import com.backend.model.IndexData;

public class ParserTest {

    //To get working directory
    private final File cwd = new File("").getAbsoluteFile();
    //To add the subsequent file structure for the test data
    private final String cwdString = cwd.getAbsolutePath() + "\\src\\test\\java\\dummyData";

    //Test on the one html file without header or footer
    @Test
    public void testParseDoc() {
        //Parsing only the first test html file
        IndexData result = Parser.parseDoc(cwdString + "\\validInput\\test1.html");

        IndexData expected = new IndexData();
        expected.setTitle("Spoon-Knife");
        expected.setContent("Lorem Ipsum dolor set amet.... "
        + "this is content that I want to be read as the body/content by boilerpipe. "
        + "this is random text in another paragraph. ");

        assertEquals( expected.toString(), result.toString());
    }

    //Test on the all html file in folder with extra data as header and footer
    @Test
    public void testParseAllDoc() {
        //Output that is expected of each html file
        String contentString = "Lorem Ipsum dolor set amet.... "
        + "this is content that I want to be read as the body/content by boilerpipe. "
        + "this is random text in another paragraph. ";

        //All test will have the same output with different inputs to test boilerpipe's filtering when parsing
        //Loop to generate the multiple expected outputs
        ArrayList<IndexData> expected = new ArrayList<>();
        for (int i = 1; i < 5; i++) {
            IndexData obj = new IndexData();
            obj.setTitle("Spoon-Knife");
            obj.setContent(contentString);
            obj.setURL("validInput");
            expected.add(obj);
        }

        //Function call on the directory to parse all results
        Parser.iterateAndParseFiles(new File(cwdString), "", "");
        ArrayList<IndexData> result = Parser.getParsedDataAsJSON();

        //convert to String so test is able to compare properly
        assertEquals(expected.toString(), result.toString());
    }
}
