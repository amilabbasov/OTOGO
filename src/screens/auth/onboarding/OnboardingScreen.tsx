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
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Routes } from '../../../navigations/routes';
import type { AuthScreenProps } from '../../../navigations/types';

const OnboardingScreen = ({ onNext }: { onNext: () => void }) => {
    const { t } = useTranslation();
    const navigation = useNavigation<AuthScreenProps<Routes.onboardingPager>['navigation']>();

    const handleSignIn = () => {
        navigation.goBack();
    };
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.phoneMockup}>
                <Image
                    source={require('../../../assets/images/onboarding/mockup.png')}
                    style={styles.mockupImage}
                    resizeMode="contain"
                />
                <View style={styles.notificationsContainer}>
                    <View style={styles.notification}>
                        <SvgImage source={require('../../../assets/svg/onboarding/bitmoji-1.svg')} width={36} height={36} style={styles.avatar} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.notifName}>{t('Mehriban')}</Text>
                            <Text style={styles.notifMsg}>
                                {t('I could find the closest car wash place near me on OTOGO')}
                            </Text>
                        </View>
                        <Text style={styles.notifTime}>{t('now')}</Text>
                    </View>
                    <View style={styles.notification}>
                        <SvgImage source={require('../../../assets/svg/onboarding/bitmoji-2.svg')} width={36} height={36} style={styles.avatar} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.notifName}>{t('Adrian')}</Text>
                            <Text style={styles.notifMsg}>
                                {t('I could find the closest car wash place near me on OTOGO')}
                            </Text>
                        </View>
                        <Text style={styles.notifTime}>{t('now')}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.textBlock}>
                <Text style={styles.headline}>{t('OTOGO is closest to you')}</Text>
                <Text style={styles.subtitle}>
                    {t('Premium and prestige car hourly wash, experience the thrill at lower price.')}
                </Text>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.signInButton}
                    onPress={handleSignIn}
                >
                    <Text style={styles.signInButtonText}>{t('Sign In')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={onNext}
                >
                    <Text style={styles.continueButtonText}>{t('Get Started')}</Text>
                    <SvgImage source={require('../../../assets/svg/onboarding/circle-arrow-right.svg')} width={20} height={20} style={styles.buttonArrow} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAF9',
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
        paddingHorizontal: 24,
        gap: 80
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
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginHorizontal: 24,
        marginTop: 'auto',
        marginBottom: 20,
    },
    signInButton: {
        flex: 1,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 16,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signInButtonText: {
        color: '#111',
        fontSize: 16,
        fontWeight: '600',
    },
    continueButton: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 16,
        paddingVertical: 15,
        justifyContent: 'center',
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 16,
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
});

export default OnboardingScreen; 