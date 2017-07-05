import React, { createElement, PureComponent, PropTypes } from 'react'
import { View, Text, Alert, ActivityIndicator, ScrollView, StyleSheet } from 'react-native'
import HTML from 'html-parse-stringify'
import uniqueId from 'lodash.uniqueid'
import he from 'he'

const styles = StyleSheet.create({
  activityContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bold: {
    fontWeight: 'bold'
  },
  italic: {
    fontStyle: 'italic'
  },
  paragraph: {
    alignSelf: 'stretch',
    marginBottom: 10
  },
  break: {
    alignSelf: 'stretch',
    height: 20
  },
  containerStyle: {
    marginTop: 30
  },
  name: {
    fontSize: 25,
    marginBottom: 20
  }
})

class Bold extends PureComponent {
  static childContextTypes = {
    textStyle: PropTypes.number
  }

  getChildContext = () => ({
    textStyle: styles.bold
  })

  render = () => <Text>{this.props.children}</Text>
}
class Italic extends PureComponent {
  static childContextTypes = {
    textStyle: PropTypes.number
  }

  getChildContext = () => ({
    textStyle: styles.italic
  })

  render = () => <Text>{this.props.children}</Text>
}
const Paragraph = ({ children }) => <Text style={styles.paragraph}>{children}</Text>
const Break = () => <Text>{'\n'}</Text>
const ContextAwareText = ({ children }, context) => <Text style={context.textStyle || {}}>{children}</Text>
ContextAwareText.contextTypes = {
  textStyle: PropTypes.number
}

const convertToReact = tree => tree.map(node => {
  if (node.type === 'tag') {
    switch (node.name) {
      case 'p':
        return createElement(Paragraph, { key: uniqueId() }, convertToReact(node.children))
      case 'b':
        return createElement(Bold, { key: uniqueId() }, convertToReact(node.children))
      case 'i':
       return createElement(Italic, { key: uniqueId() }, convertToReact(node.children))
      case 'br':
        return createElement(Break, { key: uniqueId() }, convertToReact(node.children))
    }
  } else if (node.type === 'text') {
    return createElement(ContextAwareText, { key: uniqueId() }, [he.decode(node.content)])
  }
})

export default class App extends PureComponent {
  state = {
    isLoaded: false,
    data: null
  }

  componentWillMount = () => fetch('https://cap_america.inkitt.de/1/stories/106766/chapters/1')
    .then(data => data.json())
    .then(({ response: data }) => this.setState(() => ({ isLoaded: true, data })))
    .catch(e => Alert.alert("Error", e.message))

  render = () => {
    const { isLoaded, data } = this.state
    if (!isLoaded) {
      return (
        <View style={styles.activityContainer}>
          <ActivityIndicator size="large" />
        </View>
      )
    }
    const reactNodes = convertToReact(HTML.parse(data.text))
    return (
      <ScrollView style={styles.containerStyle}>
        <Text style={styles.name}>{data.name}</Text>
        {reactNodes}
      </ScrollView>
    )
  }
}
