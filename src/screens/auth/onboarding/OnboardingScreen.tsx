import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Image,
} from 'react-native';
import { SvgImage } from '../../../components/svgImage/SvgImage';

const OnboardingScreen = ({ navigation }: any) => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.navigationDots}>
                <View style={[styles.dot, styles.activeDot]} />
                <View style={styles.dot} />
            </View>

            <TouchableOpacity style={styles.skip} onPress={() => navigation.replace('Home')}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <View style={styles.phoneMockup}>
                <Image 
                    source={require('../../../assets/images/onboarding/mockup.png')} 
                    style={styles.mockupImage}
                    resizeMode="contain"
                />
                <View style={styles.notificationsContainer}>
                    <View style={styles.notification}>
                        <SvgImage source={require('../../../assets/svg/onboarding/bitmoji-1.svg')} width={40} height={40} style={styles.avatar} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.notifName}>Mehriban</Text>
                            <Text style={styles.notifMsg}>
                                OTOGO sayəsində yaxınlıqda mənə uyğun avto yuma məntəqəsini tapa bildim
                            </Text>
                        </View>
                        <Text style={styles.notifTime}>now</Text>
                    </View>
                    <View style={styles.notification}>
                        <SvgImage source={require('../../../assets/svg/onboarding/bitmoji-2.svg')} width={32} height={32} style={styles.avatar} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.notifName}>Adrian</Text>
                            <Text style={styles.notifMsg}>
                                OTOGO sayəsində yaxınlıqda mənə uyğun avto yuma məntəqəsini tapa bildim
                            </Text>
                        </View>
                        <Text style={styles.notifTime}>now</Text>
                    </View>
                </View>
            </View>

            <View style={styles.textBlock}>
                <Text style={styles.headline}>OTOGO sənə ən yaxın</Text>
                <Text style={styles.subtitle}>
                    Premium and prestige car hourly rental, experience the thrill at lower price.
                </Text>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.replace('UserTypeSelection')}
            >
                <Text style={styles.buttonText}>Get Started</Text>
                <SvgImage source={require('../../../assets/svg/onboarding/circle-arrow-right.svg')} width={20} height={20} style={styles.buttonArrow} />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#F8FAF9',
    },
    skip: { 
        position: 'absolute', 
        right: 24,
        marginTop: 70,
    },
    skipText: { 
        color: '#090909', 
        fontSize: 16,
    },
    phoneMockup: {
        marginTop: 80,
        alignItems: 'center',
        justifyContent: 'center',
        height: 260,
        position: 'relative',
    },
    notification: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 12,
        paddingRight: 18,
        width: '90%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    avatar: {
        fontSize: 32,
        marginRight: 10
    },
    notifName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#222'
    },
    notifMsg: {
        color: '#00000033',
        fontSize: 11,
        fontWeight: '500',
        marginTop: 2
    },
    notifTime: { 
        color: '#00000033', 
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8 
    },
    textBlock: { 
        marginTop: 120, 
        paddingHorizontal: 24 
    },
    headline: { 
        fontSize: 36, 
        fontWeight: '700', 
        color: '#111', 
    },
    subtitle: { 
        color: '#888', 
        fontSize: 14,
        fontWeight: '400',
        marginTop: 100,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 16,
        paddingVertical: 15,
        justifyContent: 'center',
        marginHorizontal: 24,
        marginTop: 'auto',
        marginBottom: 20,
    },
    buttonText: { 
        color: '#fff', 
        fontSize: 18, 
        fontWeight: '600', 
        marginRight: 8,
    },
    buttonArrow: { 
        marginLeft: 8,
    },
    mockupImage: {
        width: 450,
        height: 350,
        opacity: 0.8,
    },
    notificationsContainer: {
        position: 'absolute',
        top: 150,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        gap: 10,
    },
    navigationDots: {
        position: 'absolute',
        top: 70,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 4,
        opacity: 0.6,
    },
    activeDot: {
        backgroundColor: '#111',
        opacity: 1,
        transform: [{ scale: 1.2 }],
    },
});

export default OnboardingScreen; 