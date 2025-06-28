import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from 'react-native';
import { SvgImage } from '../../../components/svgImage/SvgImage';

const OnboardingScreen = ({ navigation }: any) => {
    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.skip} onPress={() => navigation.replace('Home')}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <View style={styles.phoneMockup}>
                <View style={[styles.notification, { top: 60 }]}>
                    <SvgImage source={require('../../../assets/svg/onboarding/bitmoji-1.svg')} width={32} height={32} style={styles.avatar} />
                    <View style={{ flex: 1 }}>
                        <Text style={styles.notifName}>Mehriban</Text>
                        <Text style={styles.notifMsg}>
                            OTOGO sayəsində yaxınlıqda mənə uyğun avto yuma məntəqəsini tapa bildim
                        </Text>
                    </View>
                    <Text style={styles.notifTime}>now</Text>
                </View>
                <View style={[styles.notification, { top: 120 }]}>
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
                <Text style={styles.buttonArrow}>→</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAF9' },
    skip: { position: 'absolute', top: 16, right: 24, zIndex: 10 },
    skipText: { color: '#D1D5DB', fontSize: 16 },
    phoneMockup: {
        marginTop: 32,
        alignItems: 'center',
        height: 260,
        justifyContent: 'center',
    },
    phoneImage: {
        width: 260,
        height: 200,
        opacity: 0.7,
        position: 'absolute',
        top: 0,
    },
    notification: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 12,
        paddingRight: 18,
        marginBottom: 8,
        width: 320,
        position: 'absolute',
        left: '50%',
        transform: [{ translateX: -160 }],
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
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
        color: '#A0A0A0', 
        fontSize: 13, 
        marginTop: 2 
    },
    notifTime: { color: '#C0C0C0', fontSize: 13, marginLeft: 8 },
    textBlock: { marginTop: 40, paddingHorizontal: 24 },
    headline: { fontSize: 32, fontWeight: 'bold', color: '#111', marginBottom: 12 },
    subtitle: { color: '#888', fontSize: 15, marginBottom: 32 },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 16,
        paddingVertical: 18,
        justifyContent: 'center',
        marginHorizontal: 24,
        marginTop: 'auto',
        marginBottom: 32,
    },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: '600', marginRight: 8 },
    buttonArrow: { color: '#fff', fontSize: 20 },
});

export default OnboardingScreen; 