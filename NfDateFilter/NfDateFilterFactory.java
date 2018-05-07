package io.nathanfriend.solr;

import java.util.Map;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.util.TokenFilterFactory;

public class NfDateFilterFactory extends TokenFilterFactory {

	public NfDateFilterFactory(Map<String, String> args) {
		super(args);
		// TODO Auto-generated constructor stub
	}

	@Override
	public TokenStream create(TokenStream ts) {
		return new NfDateFilter(ts);
	}
}
