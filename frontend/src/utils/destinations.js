const TENANT_DESTINATIONS = {
  manali: ['Manali', 'Rohtang Pass', 'Solang Valley', 'Manikaran', 'Kasol', 'Kullu', 'Naggar', 'Jogini Falls', 'Vashisht', 'Jibhi', 'Tirthan Valley', 'Bir Billing', 'Spiti Valley'],
  jaipur: ['Jaipur', 'Amer', 'Nahargarh Fort', 'Galtaji', 'Chokhi Dhani', 'Samode', 'Bikaner', 'Pushkar', 'Bagru', 'Sanganer', 'Alwar', 'Mandawa', 'Shekhawati'],
  rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur', 'Bikaner', 'Jaisalmer', 'Pushkar', 'Ranthambore', 'Mount Abu', 'Chittorgarh', 'Kumbhalgarh', 'Mandawa', 'Alwar'],
  goa: ['North Goa', 'South Goa', 'Baga Beach', 'Anjuna Beach', 'Palolem Beach', 'Dudhsagar Falls', 'Panaji', 'Old Goa', 'Fort Aguada', 'Mandovi River', 'Calangute', 'Vagator'],
  kerala: ['Munnar', 'Alleppey', 'Kochi', 'Varkala', 'Kumarakom', 'Thekkady', 'Wayanad', 'Kovalam', 'Trivandrum', 'Kozhikode', 'Kannur', 'Athirappilly'],
  ladakh: ['Leh', 'Nubra Valley', 'Pangong Lake', 'Tso Moriri', 'Khardung La', 'Hemis', 'Shanti Stupa', 'Magnetic Hill', 'Zanskar', 'Kargil', 'Tso Kar'],
  udaipur: ['Udaipur', 'City Palace', 'Lake Pichola', 'Kumbhalgarh', 'Ranakpur', 'Fateh Sagar', 'Chittorgarh', 'Jag Mandir', 'Mount Abu', 'Nathdwara'],
  sikkim: ['Gangtok', 'Tsomgo Lake', 'Nathula Pass', 'Pelling', 'Yuksom', 'Rumtek', 'Zuluk', 'Lachen', 'Lachung', 'Gurudongmar'],
  andaman: ['Port Blair', 'Havelock Island', 'Neil Island', 'Baratang Island', 'Cellular Jail', 'Radhanagar Beach', 'Elephant Beach', 'Ross Island', 'North Bay'],
  tokyo: ['Tokyo', 'Shinjuku', 'Shibuya', 'Asakusa', 'Ginza', 'Akihabara', 'Harajuku', 'Ueno', 'Roppongi', 'Odaiba'],
  paris: ['Paris', 'Eiffel Tower', 'Louvre', 'Montmartre', 'Le Marais', 'Latin Quarter', 'Champs-Élysées', 'Saint-Germain'],
  dubai: ['Dubai', 'Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Dubai Marina', 'JBR', 'Deira', 'Al Fahidi'],
}

const DEFAULT_DESTINATIONS = ['Goa', 'Manali', 'Jaipur', 'Kerala', 'Ladakh', 'Udaipur', 'Sikkim', 'Andaman']

export function getTenantDestinations(subdomain) {
  return TENANT_DESTINATIONS[subdomain] || DEFAULT_DESTINATIONS
}

export { TENANT_DESTINATIONS, DEFAULT_DESTINATIONS }
