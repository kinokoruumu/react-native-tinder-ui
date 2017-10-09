import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    Animated,
    PanResponder,
    Dimensions,
} from 'react-native';
import clamp from 'clamp';

const People = [
    'red',
    'green',
    'blue',
    'purple',
    'orange',
];

const SWIPE_THRESHOLD = 120;

export class Main extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            pan: new Animated.ValueXY(),
            enter: new Animated.Value(0.5),
            person: People[0],
        }
    }

    _goToNextPerson() {
        let currentPersonIdx = People.indexOf(this.state.person);
        let newIdx = currentPersonIdx + 1;

        this.setState({
            person: People[newIdx > People.length - 1 ? 0 : newIdx]
        });
    }

    componentDidMount() {
        this._animateEntrance();
    }

    _animateEntrance() {
        Animated.spring(
            this.state.enter,
            { toValue: 1, friction: 8 }
        ).start();
    }

    componentWillMount() {
        this._panResponder = PanResponder.create({
            onMoveShouldSetResponderCapture: () => true,
            onMoveShouldSetPanResponderCapture: () => true,

            onPanResponderGrant: (e, gestureState) => {
                this.state.pan.setOffset({x: this.state.pan.x._value, y: this.state.pan.y._value});
                this.state.pan.setValue({x: 0, y: 0});
            },

            onPanResponderMove: Animated.event([
                null, {dx: this.state.pan.x, dy: this.state.pan.y},
            ]),

            onPanResponderRelease: (e, {vx, vy}) => {
                this.state.pan.flattenOffset();
                let velocity;

                if (vx >= 0) {
                    velocity = clamp(vx, 3, 5);
                } else if (vx < 0) {
                    velocity = clamp(vx * -1, 3, 5) * -1;
                }

                if (Math.abs(this.state.pan.x._value) > SWIPE_THRESHOLD) {
                    Animated.decay(this.state.pan, {
                        velocity: {x: velocity, y: vy},
                        deceleration: 0.98
                    }).start(this._resetState)
                } else {
                    Animated.spring(this.state.pan, {
                        toValue: {x: 0, y: 0},
                        friction: 4
                    }).start()
                }
            }
        })
    }

    _resetState() {
        this.state.pan.setValue();
        this.state.enter.setValue(0);
        this._goToNextPerson();
        this._animateEntrance();
    }

    render() {
        const { pan, enter, } = this.state;

        const [translateX, translateY] = [pan.x, pan.y];

        const rotate = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: ["-30deg", "0deg", "30deg"]});
        const opacity = pan.x.interpolate({inputRange: [-200, 0, 200], outputRange: [0.5, 1, 0.5]})
        const scale = enter;

        const animatedCardStyles = {transform: [{translateX}, {translateY}, {rotate}, {scale}], opacity};

        const yupOpacity = pan.x.interpolate({
            inputRange: [0, 150],
            outputRange: [0, 1]
        });
        const yupScale = pan.x.interpolate({
            inputRange: [0, 150],
            outputRange: [0.5, 1],
            extrapolate: 'clamp'
        });
        const animatedYupStyles = {
            transform: [{scale: yupScale}],
            opacity: yupOpacity
        };
        const nopeOpacity = pan.x.interpolate({
            inputRange: [-150, 0],
            outputRange: [1, 0]
        });
        const nopeScale = pan.x.interpolate({
            inputRange: [-150, 0],
            outputRange: [1, 0.5],
            extrapolate: 'clamp'
        });
        const animatedNopeStyles = {
            transform: [{scale: nopeScale}],
            opacity: nopeOpacity
        };

        return (
            <View style={styles.container}>
                <Animated.View style={[styles.card, animatedCardStyles, {backgroundColor: this.state.person}]} {...this._panResponder.panHandlers}>
                </Animated.View>

                <Animated.View style={[styles.nope, animatedNopeStyles]}>
                    <Text style={styles.nopeText}>Nope!</Text>
                </Animated.View>

                <Animated.View style={[styles.yup, animatedYupStyles]}>
                    <Text style={styles.yupText}>Yup!</Text>
                </Animated.View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    card: {
        width: Dimensions.get('window').width - 50,
        height: Dimensions.get('window').height - 200,
        backgroundColor: 'red',
    },
    yup: {
        borderColor: 'green',
        borderWidth: 2,
        position: 'absolute',
        padding: 20,
        bottom: 20,
        borderRadius: 5,
        right: 20,
    },
    yupText: {
        fontSize: 16,
        color: 'green',
    },
    nope: {
        borderColor: 'red',
        borderWidth: 2,
        position: 'absolute',
        bottom: 20,
        padding: 20,
        borderRadius: 5,
        left: 20,
    },
    nopeText: {
        fontSize: 16,
        color: 'red',
    }
});