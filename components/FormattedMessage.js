import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function FormattedMessage({ content, isUser }) {
  // Parse content into blocks (text, formulas, code)
  const parseContent = (text) => {
    const blocks = [];
    let currentIndex = 0;

    // Find code blocks first ```language\ncode```
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const codeMatches = [];
    let codeMatch;
    
    while ((codeMatch = codeBlockRegex.exec(text)) !== null) {
      codeMatches.push({
        start: codeMatch.index,
        end: codeMatch.index + codeMatch[0].length,
        language: codeMatch[1] || 'code',
        code: codeMatch[2]
      });
    }

    // Find inline code `code`
    const inlineCodeRegex = /`([^`]+)`/g;
    const inlineCodeMatches = [];
    let inlineMatch;
    
    while ((inlineMatch = inlineCodeRegex.exec(text)) !== null) {
      // Skip if inside a code block
      const insideCodeBlock = codeMatches.some(
        cm => inlineMatch.index >= cm.start && inlineMatch.index < cm.end
      );
      if (!insideCodeBlock) {
        inlineCodeMatches.push({
          start: inlineMatch.index,
          end: inlineMatch.index + inlineMatch[0].length,
          code: inlineMatch[1]
        });
      }
    }

    // Find display equations $$...$$
    const displayEqRegex = /\$\$([\s\S]*?)\$\$/g;
    const displayEqMatches = [];
    let eqMatch;
    
    while ((eqMatch = displayEqRegex.exec(text)) !== null) {
      displayEqMatches.push({
        start: eqMatch.index,
        end: eqMatch.index + eqMatch[0].length,
        formula: eqMatch[1]
      });
    }

    // Find inline equations $...$
    const inlineEqRegex = /\$([^\$]+?)\$/g;
    const inlineEqMatches = [];
    let inlineEq;
    
    while ((inlineEq = inlineEqRegex.exec(text)) !== null) {
      // Skip if inside display equation or code block
      const insideOther = [...codeMatches, ...displayEqMatches].some(
        m => inlineEq.index >= m.start && inlineEq.index < m.end
      );
      if (!insideOther) {
        inlineEqMatches.push({
          start: inlineEq.index,
          end: inlineEq.index + inlineEq[0].length,
          formula: inlineEq[1]
        });
      }
    }

    // Combine and sort all matches
    const allMatches = [
      ...codeMatches.map(m => ({...m, type: 'codeBlock'})),
      ...inlineCodeMatches.map(m => ({...m, type: 'inlineCode'})),
      ...displayEqMatches.map(m => ({...m, type: 'displayEq'})),
      ...inlineEqMatches.map(m => ({...m, type: 'inlineEq'}))
    ].sort((a, b) => a.start - b.start);

    // Build blocks
    allMatches.forEach((match, i) => {
      // Add text before match
      if (match.start > currentIndex) {
        const textContent = text.substring(currentIndex, match.start);
        if (textContent.trim()) {
          blocks.push({
            type: 'text',
            content: textContent,
            key: `text-${currentIndex}`
          });
        }
      }

      // Add special block
      blocks.push({
        type: match.type,
        content: match.code || match.formula,
        language: match.language,
        key: `${match.type}-${match.start}`
      });

      currentIndex = match.end;
    });

    // Add remaining text
    if (currentIndex < text.length) {
      const textContent = text.substring(currentIndex);
      if (textContent.trim()) {
        blocks.push({
          type: 'text',
          content: textContent,
          key: `text-end`
        });
      }
    }

    return blocks.length > 0 ? blocks : [{type: 'text', content: text, key: 'single'}];
  };

  const formatFormula = (latex) => {
    return latex
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
      .replace(/\\sqrt/g, '√')
      .replace(/\\pm/g, '±')
      .replace(/\^(\d+)/g, (match, p1) => {
        const superscripts = '⁰¹²³⁴⁵⁶⁷⁸⁹';
        return p1.split('').map(d => superscripts[d]).join('');
      })
      .replace(/\^2/g, '²')
      .replace(/\^3/g, '³')
      .replace(/\\pi/g, 'π')
      .replace(/\\theta/g, 'θ')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\delta/g, 'δ')
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\leq/g, '≤')
      .replace(/\\geq/g, '≥')
      .replace(/\\neq/g, '≠')
      .replace(/\\infty/g, '∞')
      .replace(/\\[a-z]+/g, '')
      .trim();
  };

  const renderText = (text) => {
    // Parse bold **text**
    const parts = [];
    const boldRegex = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(<Text key={`bold-${match.index}`} style={styles.bold}>{match[1]}</Text>);
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  const blocks = parseContent(content);

  return (
    <View style={styles.container}>
      {blocks.map((block) => {
        switch (block.type) {
          case 'codeBlock':
            return (
              <View key={block.key} style={styles.codeBlock}>
                <View style={styles.codeHeader}>
                  <Text style={styles.codeLanguage}>{block.language}</Text>
                </View>
                <View style={styles.codeContainer}>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  >
                    <Text style={styles.codeText}>{block.content}</Text>
                  </ScrollView>
                </View>
              </View>
            );
          
          case 'inlineCode':
            return (
              <Text key={block.key} style={styles.inlineCode}>
                {block.content}
              </Text>
            );
          
          case 'displayEq':
            return (
              <View key={block.key} style={styles.formulaBlock}>
                <Text style={styles.formulaText}>{formatFormula(block.content)}</Text>
              </View>
            );
          
          case 'inlineEq':
            return (
              <Text key={block.key} style={styles.inlineFormula}>
                {formatFormula(block.content)}
              </Text>
            );
          
          default:
            return (
              <Text key={block.key} style={styles.text}>
                {renderText(block.content)}
              </Text>
            );
        }
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#fff',
  },
  bold: {
    fontWeight: '600',
    color: '#4a9eff',
  },
  codeBlock: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginVertical: 8,
    overflow: 'hidden',
    maxHeight: 300,
  },
  codeHeader: {
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  codeLanguage: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    textTransform: 'lowercase',
  },
  codeContainer: {
    maxHeight: 250,
  },
  codeText: {
    fontFamily: 'Courier',
    fontSize: 13,
    color: '#10b981',
    padding: 12,
    lineHeight: 18,
  },
  inlineCode: {
    fontFamily: 'Courier',
    fontSize: 14,
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  formulaBlock: {
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#9333ea',
    padding: 14,
    borderRadius: 8,
    marginVertical: 8,
  },
  formulaText: {
    fontFamily: 'Courier',
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    textAlign: 'center',
  },
  inlineFormula: {
    fontFamily: 'Courier',
    fontSize: 15,
    color: '#c084fc',
    backgroundColor: 'rgba(147, 51, 234, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});