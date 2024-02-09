from dotenv import load_dotenv
import os
import psycopg2
from get_financial_report import get_financial_report

financial_report = get_financial_report('0439.312.406')

rubrics = financial_report.get("Rubrics")


### Le fonds de roulement net (FRN) ###

accounts_10_15 = next((item.get("Value") for item in rubrics if item.get("Code") == "10/15"), 0)
account_16 = next((item.get("Value") for item in rubrics if item.get("Code") == "16"), 0)
account_17 = next((item.get("Value") for item in rubrics if item.get("Code") == "17"), 0)
account_19 = next((item.get("Value") for item in rubrics if item.get("Code") == "19"), 0)

capitaux_permanents = float(accounts_10_15) + float(account_16) + float(account_17) + float(account_19)

account_20 = next((item.get("Value") for item in rubrics if item.get("Code") == "20"), 0)
accounts_21_28 = next((item.get("Value") for item in rubrics if item.get("Code") == "21/28"), 0)

actifs_immobilises = float(account_20) + float(accounts_21_28)

frn = capitaux_permanents - actifs_immobilises
print('frn', frn)


### Le besoin de fonds de roulement (BFR) ###

accounts_29_58 = next((item.get("Value") for item in rubrics if item.get("Code") == "29/58"), 0)

actifs_circulants_d_exploitation = float(accounts_29_58)

account_43 = next((item.get("Value") for item in rubrics if item.get("Code") == "43"), 0)
account_44 = next((item.get("Value") for item in rubrics if item.get("Code") == "44"), 0)
account_45 = next((item.get("Value") for item in rubrics if item.get("Code") == "45"), 0)
account_46 = next((item.get("Value") for item in rubrics if item.get("Code") == "46"), 0)
accounts_47_48 = next((item.get("Value") for item in rubrics if item.get("Code") == "47/48"), 0)
account_49 = next((item.get("Value") for item in rubrics if item.get("Code") == "492/3"), 0)

dettes_a_court_terme_d_exploitation = float(account_43) + float(account_44) + float(account_45) + float(account_46) + float(accounts_47_48) + float(account_49)

bfr = actifs_circulants_d_exploitation - dettes_a_court_terme_d_exploitation
print('bfr', bfr)

### Marge nette sur ventes (MNV) ###

accounts_70_76A = next((item.get("Value") for item in rubrics if item.get("Code") == "70/76A"), 0)
ventes_et_prestations = float(accounts_70_76A)

accounts_60_66A = next((item.get("Value") for item in rubrics if item.get("Code") == "60/66A"), 0)
cout_des_ventes_et_prestations = float(accounts_60_66A)

account_70 = next((item.get("Value") for item in rubrics if item.get("Code") == "70"), 0)
chiffre_d_affaires = float(account_70)

account_74 = next((item.get("Value") for item in rubrics if item.get("Code") == "74"), 0)
autres_produits_d_exploitation = float(account_74)

mnv = (ventes_et_prestations - cout_des_ventes_et_prestations) / (chiffre_d_affaires + autres_produits_d_exploitation)
print('mnv', mnv)

### ROI (retour sur investissements) ###

account_9903 = next((item.get("Value") for item in rubrics if item.get("Code") == "9903"), 0)
benefice_de_l_exercice = float(account_9903)

account_67 = next((item.get("Value") for item in rubrics if item.get("Code") == "67/77"), 0)
impot_sur_le_resultat = float(account_67)

account_650 = next((item.get("Value") for item in rubrics if item.get("Code") == "650"), 0)
charge_des_dettes = float(account_650)

accounts_20_58 = next((item.get("Value") for item in rubrics if item.get("Code") == "20/58"), 0)
total_actif = float(accounts_20_58)

roi = (benefice_de_l_exercice - impot_sur_le_resultat - charge_des_dettes) / total_actif
print('roi', roi)

### Le nombre de jours de crédit clients (JCC) ###

account_40 = next((item.get("Value") for item in rubrics if item.get("Code") == "40"), 0)
creances_commerciales_a_un_an_au_plus = float(account_40)

account_70 = next((item.get("Value") for item in rubrics if item.get("Code") == "70"), 0)
chiffre_d_affaires = float(account_70)

account_74 = next((item.get("Value") for item in rubrics if item.get("Code") == "74"), 0)
autres_produits_d_exploitation = float(account_74)

jcc = (creances_commerciales_a_un_an_au_plus * 365) / (chiffre_d_affaires + autres_produits_d_exploitation)
print('jcc', jcc)

### Le ratio de solvabilité générale ###

accounts_20_58 = next((item.get("Value") for item in rubrics if item.get("Code") == "20/58"), 0)
total_actif = float(accounts_20_58)

accounts_10_49 = next((item.get("Value") for item in rubrics if item.get("Code") == "10/49"), 0)
total_passif = float(accounts_10_49)

accounts_10_15 = next((item.get("Value") for item in rubrics if item.get("Code") == "10/15"), 0)
capitaux_propres = float(accounts_10_15)

rsg = total_actif / (total_passif - capitaux_propres)
print('rsg', rsg)

### Acid Test Ratio (ATR) ###

account_40 = next((item.get("Value") for item in rubrics if item.get("Code") == "40"), 0)
creances_commerciales_a_un_an_au_plus = float(account_40)

accounts_50_53 = next((item.get("Value") for item in rubrics if item.get("Code") == "50/53"), 0)
placements_de_tresorerie = float(accounts_50_53)

accounts_54_58 = next((item.get("Value") for item in rubrics if item.get("Code") == "54/58"), 0)
valeurs_disponibles = float(accounts_54_58)

accounts_42_48 = next((item.get("Value") for item in rubrics if item.get("Code") == "42/48"), 0)
dettes_a_un_an_au_plus = float(accounts_42_48)

atr = (creances_commerciales_a_un_an_au_plus + placements_de_tresorerie + valeurs_disponibles) / dettes_a_un_an_au_plus
print('atr', atr)