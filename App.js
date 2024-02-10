import React, { useState, useRef, useEffect } from 'react';
import { Text, View, Button, StyleSheet, StatusBar, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as Sharing from 'expo-sharing';
import _ from 'lodash';
import { captureRef } from 'react-native-view-shot';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as SQLite from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';

const db = SQLite.openDatabase('binomes.db');
const c1 = [
	'Makeda Banza',
	'Bibiche Kweshi',
	'Audrey kabamba',
	'Rachel Lusamba',
	'Keren Mukadi',
	'Jenny KWEMBE',
	'Sharon Kabongo',
	'Rahma Mwamba',
	'Jael Kalombo',
	// 'Joëlle Manyaka',
	'Hélène Mwinkeu',
	'Gracevie Nzumba',
	'Paulin Lubamba',
	'Michael Mutumba',
	'Patrick Nzita',
	'Marc Musasa',
	'Joël MPUNGA',
	// 'Abedi Force',
	'Daniel Wadimuka',
	'JeanMarie Samakila',
	'Israël Nzila',
	'Alpha Kandolo',
	'salva LUPETA',
	'Ackeem Mbuebua',
	'Sudi Martin',
	'James Kabeya',
	'Flavio Umba',
	'Laura Kabeya',
	// 'Graciella kamwena',
	// 'Salva Amisi'
];

const c2 = [
	"Ruth Musasa",
	"Agapy Kyungu",
	"Anita Kulungu",
	"Jenifer Lungwangu",
	"Kestia Kasongo",
	"Romaine LONDONI",
	"Prisca Kayembe",
	// "Aurélie Mwad",
	"Aaron Bukasa",
	"Betsaleel YotoYolongo",
	"Jerry Lunda",
	"Kanku Alain",
	"Glody Mafo",
	"JEHOVANNY MBENGA",
	"Victoire Ilunga",
	"CHADRACK EMONGO",
	"Ruben Lubasa",
	"Osee Kimelongo",
	"Lydie Dunia"
];


db.transaction((tx) => {
	tx.executeSql(
		'CREATE TABLE IF NOT EXISTS binomes (id INTEGER PRIMARY KEY AUTOINCREMENT, binome1 TEXT, binome2 TEXT);'
	);
});

const colors = {
	red: '#B70F2F',
	dark: '#000',
	white: '#fff'
}

export default function App() {
	const [binomes, setBinomes] = useState([]);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const viewShotRef = useRef();
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [generated, setGenerated] = useState(false);
	const [loading, setLoading] = useState(false);

	const clearBinomes = () => {
		db.transaction((tx) => {
			tx.executeSql(
				'DELETE FROM binomes;',
				[],
				() => {
					console.log('Table "binomes" vidée avec succès.');
					setBinomes([]);
				},
				(_, error) => {
					console.log('Erreur lors de la suppression des binômes : ' + error);
				}
			);
		});
	};


	const handleDateChange = (event, date) => {
		setShowDatePicker(false);
		if (date) {
			setSelectedDate(date);
		}
	};

	const openDatePicker = () => {
		setShowDatePicker(true);
	};


	const generateBinomes = (classe) => {
		setLoading(true);
		setGenerated(false);
		const shuffledStudents = _.shuffle(classe);
		const newBinomes = [];

		db.transaction((tx) => {
			tx.executeSql(
				'CREATE TABLE IF NOT EXISTS binomes (id INTEGER PRIMARY KEY AUTOINCREMENT, binome1 TEXT, binome2 TEXT);',
				[],
				() => {
					for (let i = 0; i < shuffledStudents.length; i += 2) {
						const binome1 = shuffledStudents[i];
						const binome2 = shuffledStudents[i + 1] || '';

						tx.executeSql(
							'SELECT * FROM binomes WHERE binome1 = ? OR binome2 = ?;',
							[binome1, binome2],
							(_, { rows }) => {
								if (rows.length === 0) {
									newBinomes.push([binome1, binome2]);

									tx.executeSql(
										'INSERT INTO binomes (binome1, binome2) VALUES (?, ?);',
										[binome1, binome2],
										(_, { insertId }) => {
											console.log('Binôme inséré avec succès. ID : ' + insertId);
										},
										(_, error) => {
											console.log('Erreur lors de l\'insertion du binôme : ' + error);
										}
									);
								}
							},
							(_, error) => {
								console.log('Erreur lors de la vérification des binômes : ' + error);
							}
						);
					}
				}
			);
		});
		return newBinomes;
	};

	const generateBinomesLogic = (classe) => {
		// Génération des binômes
		const newBinomes = generateBinomes(classe);

		console.log('====================================');
		console.log(newBinomes);
		console.log('================ ====================');

		// Mise à jour de l'état binomes
		setBinomes(newBinomes);

		setLoading(false);
		setGenerated(true);
	};



	const shareBinomes = async () => {
		const imageUri = await captureRef(viewShotRef, {
			format: 'jpg',
			quality: 1,
		});
		const sharingOptions = {
			mimeType: 'image/jpeg',
			dialogTitle: `Partager les binômes semaine du ${selectedDate}`,
			UTI: 'public.jpeg',
		};

		await Sharing.shareAsync(imageUri, sharingOptions);
	};

	return (
		<ScrollView style={styles.container}>
			<StatusBar />
			<Image style={styles.logo} source={require('./assets/kadea-long.png')} />
			<View style={styles.actionSection}>
				<TouchableOpacity
					onPress={openDatePicker}
					style={styles.redBtn}
				>
					<Text style={styles.redBtnText}>{selectedDate ? selectedDate.toISOString().split('T')[0] : 'Sélectionner une date'}</Text>
					<Ionicons name="calendar-outline" size={24} color={colors.white} />
				</TouchableOpacity>
				{showDatePicker && (
					<DateTimePicker
						value={selectedDate}
						mode="date"
						display="default"
						onChange={handleDateChange}
					/>
				)}

				{loading ? (
					<ActivityIndicator size="large" color="blue" />
				) : (
					<>
						<View style={styles.generateAction}>
							<TouchableOpacity
								onPress={() => generateBinomesLogic(c1)}
								style={styles.darkBtn}
							>
								<Text style={styles.darkBtnText}>Binômes L1</Text>
								<Ionicons name="download-outline" size={24} color={colors.white} />
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => generateBinomesLogic(c2)}
								style={styles.darkBtn}
							>
								<Text style={styles.darkBtnText}>Binômes L2</Text>
								<Ionicons name="download-outline" size={24} color={colors.white} />
							</TouchableOpacity>
						</View>
						<Button title="Nettoyer la base" onPress={clearBinomes} />
					</>
				)}

			</View>
			<View style={styles.resultSection}>
				<View ref={viewShotRef}>
					{generated && binomes.length == 0 && <Text>Nombre des combinaisons limite atteint</Text>}
					{generated && binomes.length > 0 && (
						<View>
							<Text style={{ fontSize: 20, fontWeight: 'bold' }}>Binômes semaine du {selectedDate.toISOString().split('T')[0]}</Text>
							{binomes.map((binome, index) => (
								<Text key={index}>{binome.join(' - ')}</Text>
							))}
						</View>
					)}
				</View>
				{generated &&
					<TouchableOpacity
						onPress={shareBinomes}
						style={styles.redBtn}
					>
						<Text style={styles.redBtnText}>Partager les binômes</Text>
						<Ionicons name="share-outline" size={24} color={colors.white} />
					</TouchableOpacity>}
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		margin: 20,
	},
	logo: {
		height: 100,
		width: '80%',
		marginVertical: 10
	},
	actionSection: {
		// flex: 1,
	},
	resultSection: {
		marginVertical: 10,
	},
	redBtn: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 20,
		width: 'auto',
		height: 50,
		backgroundColor: colors.red,
		marginVertical: 5,
	},
	redBtnText: {
		color: colors.white,
		fontWeight: '600',
		fontSize: 16,
		marginEnd: 5
	},
	generateAction: {
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	darkBtn: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 20,
		width: '48%',
		height: 50,
		backgroundColor: colors.dark,
		marginVertical: 5,
	},
	darkBtnText: {
		color: colors.white,
		fontWeight: '600',
		fontSize: 15,
		marginEnd: 5
	},
});
