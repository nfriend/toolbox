package io.nathanfriend.solr;

import java.io.IOException;
import java.lang.invoke.MethodHandles;
import java.util.LinkedList;
import java.util.Queue;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.apache.lucene.analysis.TokenFilter;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute;
import org.apache.lucene.analysis.tokenattributes.PositionIncrementAttribute;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;

public final class NfDateFilter extends TokenFilter {
	private static final Logger log = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());
	private CharTermAttribute charTermAttr;
	private PositionIncrementAttribute posIncAttr;
	private Queue<char[]> terms;

	protected NfDateFilter(TokenStream ts) {
		super(ts);
		this.charTermAttr = addAttribute(CharTermAttribute.class);
		this.posIncAttr = addAttribute(PositionIncrementAttribute.class);
		this.terms = new LinkedList<char[]>();
	}

	@Override
	public boolean incrementToken() throws IOException {
		if (!terms.isEmpty()) {
			char[] buffer = terms.poll();
			charTermAttr.setEmpty();
			charTermAttr.copyBuffer(buffer, 0, buffer.length);
			posIncAttr.setPositionIncrement(0);
			return true;
		}

		if (!input.incrementToken()) {
			return false;
		}

		else {
			char[] buffer = charTermAttr.buffer();

			Date parsedDate = null;
			try {
				parsedDate = new SimpleDateFormat("yyyy-MM-dd").parse(String.valueOf(buffer));
			} catch (ParseException e) {
				e.printStackTrace();
				log.warn("Bad date format: \"" + String.valueOf(buffer)
						+ "\".  NfDateFilter expects dates to be formatted like \"yyyy-MM-dd\".  This value has been ignored; no new tokens have been inserted into the index.");
			}

			// if we were able to correctly parse the date,
			// continue with inserting tokens into the index
			if (parsedDate != null) {

				Calendar cal = Calendar.getInstance();
				cal.setTime(parsedDate);

				ArrayList<String> monthSynonymns = new ArrayList<String>();
				int monthNum = cal.get(Calendar.MONTH) + 1; // month numbers are
															// 0-based
				switch (monthNum) {
				case 1:
					monthSynonymns.addAll(Arrays.asList("january", "jan", "01", "1"));
					break;
				case 2:
					monthSynonymns.addAll(Arrays.asList("february", "feb", "02", "2"));
					break;
				case 3:
					monthSynonymns.addAll(Arrays.asList("march", "mar", "03", "3"));
					break;
				case 4:
					monthSynonymns.addAll(Arrays.asList("april", "apr", "04", "4"));
					break;
				case 5:
					monthSynonymns.addAll(Arrays.asList("may", "05", "5"));
					break;
				case 6:
					monthSynonymns.addAll(Arrays.asList("june", "jun", "06", "6"));
					break;
				case 7:
					monthSynonymns.addAll(Arrays.asList("july", "jul", "07", "7"));
					break;
				case 8:
					monthSynonymns.addAll(Arrays.asList("august", "aug", "08", "8"));
					break;
				case 9:
					monthSynonymns.addAll(Arrays.asList("september", "sep", "sept", "09", "9"));
					break;
				case 10:
					monthSynonymns.addAll(Arrays.asList("october", "oct", "10"));
					break;
				case 11:
					monthSynonymns.addAll(Arrays.asList("november", "nov", "11"));
					break;
				case 12:
					monthSynonymns.addAll(Arrays.asList("december", "dec", "12"));
					break;
				default:
					log.error("Unexpected month number: " + Integer.toString(monthNum));
					break;
				}

				// add the year number
				int yearNum = cal.get(Calendar.YEAR);
				String yearNumString = Integer.toString(yearNum);
				terms.add(yearNumString.toCharArray());

				// also add the last two digits as their own token, if
				// applicable.
				// For example, if the year is 1998, add "98"
				if (yearNum > 100) {
					terms.add(yearNumString.substring(yearNumString.length() - 2).toCharArray());
				}

				// add all month synonyms
				for (String month : monthSynonymns) {
					terms.add(month.toCharArray());
				}

				// add the day number(s)
				int dayNum = cal.get(Calendar.DAY_OF_MONTH);
				String dayNumString = Integer.toString(dayNum);

				// prevent duplicate tokens, in the case that
				// the day number is the same as the month number
				if (!monthSynonymns.contains(dayNumString)) {
					terms.add(dayNumString.toCharArray());

					// also add zero-padded version of day number
					// for example, add "05" for for "5"
					if (dayNum < 10) {
						terms.add(("0" + dayNumString).toCharArray());
					}
				}
			}

			return true;
		}
	}
}