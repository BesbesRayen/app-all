-- ============================================================
-- CREADITN TEST DATA SCRIPT
-- Script pour insérer des données de test dans la base de données
-- ============================================================

-- ============================================================
-- 1. INSÉRER UTILISATEURS DE TEST
-- ============================================================

INSERT INTO users (first_name, last_name, email, password_hash, phone, kyc_status, created_at, updated_at) VALUES
('Ahmed', 'Ben Ali', 'ahmed@example.com', 'password123', '+216 98 123 456', 'NOT_SUBMITTED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Fatima', 'Khaled', 'fatima@example.com', 'password123', '+216 97 654 321', 'NOT_SUBMITTED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Mohamed', 'Saïdi', 'mohamed@example.com', 'password123', '+216 96 789 012', 'NOT_SUBMITTED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Leila', 'Amira', 'leila@example.com', 'password123', '+216 95 432 109', 'NOT_SUBMITTED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================================
-- 2. INSÉRER MARCHANDS
-- ============================================================

INSERT INTO merchants (name, category, address, phone, email, logo_url, active, created_at) VALUES
('TechStore', 'Electronics', 'Tunis, Bardo', '+216 71 123 456', 'tech@store.tn', 'https://techstore.tn/logo.png', TRUE, CURRENT_TIMESTAMP),
('FashionBoutique', 'Fashion', 'Sousse, Centre Ville', '+216 73 234 567', 'fashion@boutique.tn', 'https://fashion.tn/logo.png', TRUE, CURRENT_TIMESTAMP),
('HomeDecor', 'Home & Living', 'Sfax, Medina', '+216 74 345 678', 'home@decor.tn', 'https://homedecor.tn/logo.png', TRUE, CURRENT_TIMESTAMP),
('AutoParts', 'Vehicles', 'Nabeul, Port', '+216 72 456 789', 'auto@parts.tn', 'https://autoparts.tn/logo.png', TRUE, CURRENT_TIMESTAMP);

-- ============================================================
-- 3. INSÉRER DOCUMENTS KYC (approuvés)
-- ============================================================

INSERT INTO kyc_documents (user_id, cin_front_url, cin_back_url, selfie_url, cin_number, ocr_result, status, admin_comment, created_at) VALUES
(1, 'https://example.com/user1-cin-front.jpg', 'https://example.com/user1-cin-back.jpg', 'https://example.com/user1-selfie.jpg', '12345678', 'OCR Data for user 1', 'APPROVED', 'Documents verified', CURRENT_TIMESTAMP),
(2, 'https://example.com/user2-cin-front.jpg', 'https://example.com/user2-cin-back.jpg', 'https://example.com/user2-selfie.jpg', '87654321', 'OCR Data for user 2', 'APPROVED', 'Documents verified', CURRENT_TIMESTAMP),
(3, 'https://example.com/user3-cin-front.jpg', 'https://example.com/user3-cin-back.jpg', 'https://example.com/user3-selfie.jpg', '11223344', 'OCR Data for user 3', 'APPROVED', 'Documents verified', CURRENT_TIMESTAMP),
(4, 'https://example.com/user4-cin-front.jpg', 'https://example.com/user4-cin-back.jpg', 'https://example.com/user4-selfie.jpg', '99887766', 'OCR Data for user 4', 'PENDING', 'Waiting for review', CURRENT_TIMESTAMP);

-- ============================================================
-- 4. METTRE À JOUR LE STATUT KYC DES UTILISATEURS
-- ============================================================

UPDATE users SET kyc_status = 'APPROVED' WHERE id IN (1, 2, 3);
UPDATE users SET kyc_status = 'PENDING' WHERE id = 4;

-- ============================================================
-- 5. INSÉRER SCORES DE CRÉDIT
-- ============================================================

INSERT INTO credit_scores (user_id, salary, employment_type, years_of_experience, monthly_expenses, score, max_credit_amount, created_at) VALUES
(1, 1500.00, 'Full-time Engineer', 5, 600.00, 380, 950.00, CURRENT_TIMESTAMP),
(2, 2000.00, 'Manager', 8, 800.00, 480, 1200.00, CURRENT_TIMESTAMP),
(3, 1200.00, 'Part-time Employee', 2, 500.00, 280, 700.00, CURRENT_TIMESTAMP);

-- ============================================================
-- 6. INSÉRER DEMANDES DE CRÉDIT
-- ============================================================

-- Demande 1: Ahmed - Crédit pour ordinateur chez TechStore
INSERT INTO credit_requests (user_id, merchant_id, total_amount, down_payment, number_of_installments, monthly_amount, status, created_at) VALUES
(1, 1, 800.00, 200.00, 4, 150.00, 'APPROVED', CURRENT_TIMESTAMP);

-- Demande 2: Fatima - Crédit pour vêtements chez FashionBoutique
INSERT INTO credit_requests (user_id, merchant_id, total_amount, down_payment, number_of_installments, monthly_amount, status, created_at) VALUES
(2, 2, 600.00, 100.00, 5, 100.00, 'APPROVED', CURRENT_TIMESTAMP);

-- Demande 3: Mohamed - Crédit pour mobilier chez HomeDecor
INSERT INTO credit_requests (user_id, merchant_id, total_amount, down_payment, number_of_installments, monthly_amount, status, created_at) VALUES
(3, 3, 500.00, 100.00, 4, 100.00, 'PENDING', CURRENT_TIMESTAMP);

-- Demande 4: Ahmed - Deuxième crédit sans marchand
INSERT INTO credit_requests (user_id, merchant_id, total_amount, down_payment, number_of_installments, monthly_amount, status, created_at) VALUES
(1, NULL, 400.00, 50.00, 3, 116.67, 'APPROVED', CURRENT_TIMESTAMP);

-- ============================================================
-- 7. INSÉRER VERSEMENTS (créés automatiquement après approbation)
-- ============================================================

-- Versements pour Demande 1 (Ahmed - TechStore)
INSERT INTO installments (credit_request_id, due_date, amount, status, paid_date, penalty) VALUES
(1, CURRENT_DATE + INTERVAL '30 days', 150.00, 'PAID', CURRENT_TIMESTAMP, 0),
(1, CURRENT_DATE + INTERVAL '60 days', 150.00, 'PAID', CURRENT_TIMESTAMP + INTERVAL '5 days', 5.00),
(1, CURRENT_DATE + INTERVAL '90 days', 150.00, 'PENDING', NULL, 0),
(1, CURRENT_DATE + INTERVAL '120 days', 150.00, 'PENDING', NULL, 0);

-- Versements pour Demande 2 (Fatima - FashionBoutique)
INSERT INTO installments (credit_request_id, due_date, amount, status, paid_date, penalty) VALUES
(2, CURRENT_DATE + INTERVAL '30 days', 100.00, 'PAID', CURRENT_TIMESTAMP, 0),
(2, CURRENT_DATE + INTERVAL '60 days', 100.00, 'PENDING', NULL, 0),
(2, CURRENT_DATE + INTERVAL '90 days', 100.00, 'PENDING', NULL, 0),
(2, CURRENT_DATE + INTERVAL '120 days', 100.00, 'PENDING', NULL, 0),
(2, CURRENT_DATE + INTERVAL '150 days', 100.00, 'PENDING', NULL, 0);

-- Versements pour Demande 3 (Mohamed - HomeDecor)
INSERT INTO installments (credit_request_id, due_date, amount, status, paid_date, penalty) VALUES
(3, CURRENT_DATE + INTERVAL '30 days', 100.00, 'PENDING', NULL, 0),
(3, CURRENT_DATE + INTERVAL '60 days', 100.00, 'PENDING', NULL, 0),
(3, CURRENT_DATE + INTERVAL '90 days', 100.00, 'PENDING', NULL, 0),
(3, CURRENT_DATE + INTERVAL '120 days', 100.00, 'PENDING', NULL, 0);

-- Versements pour Demande 4 (Ahmed - Crédit Direct)
INSERT INTO installments (credit_request_id, due_date, amount, status, paid_date, penalty) VALUES
(4, CURRENT_DATE + INTERVAL '30 days', 116.67, 'PENDING', NULL, 0),
(4, CURRENT_DATE + INTERVAL '60 days', 116.67, 'PENDING', NULL, 0),
(4, CURRENT_DATE + INTERVAL '90 days', 116.66, 'PENDING', NULL, 0);

-- ============================================================
-- 8. INSÉRER PAIEMENTS
-- ============================================================

-- Paiements de Ahmed pour Versement 1
INSERT INTO payments (user_id, installment_id, amount, transaction_reference, payment_method, paid_at) VALUES
(1, 1, 150.00, 'TXN_20240301_001', 'card', CURRENT_TIMESTAMP);

-- Paiement tardif de Ahmed pour Versement 2 (avec pénalité)
INSERT INTO payments (user_id, installment_id, amount, transaction_reference, payment_method, paid_at) VALUES
(1, 2, 155.00, 'TXN_20240315_002', 'bank_transfer', CURRENT_TIMESTAMP + INTERVAL '5 days');

-- Paiement de Fatima pour Versement 1
INSERT INTO payments (user_id, installment_id, amount, transaction_reference, payment_method, paid_at) VALUES
(2, 5, 100.00, 'TXN_20240301_003', 'mobile_wallet', CURRENT_TIMESTAMP);

-- ============================================================
-- 9. INSÉRER NOTIFICATIONS
-- ============================================================

-- Notifications pour Ahmed
INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES
(1, 'Documents KYC Approuvés', 'Vos documents KYC ont été vérifiés et approuvés.', 'KYC_VALIDATED', FALSE, CURRENT_TIMESTAMP - INTERVAL '60 hours'),
(1, 'Crédit Approuvé', 'Votre demande de crédit de 800 DT chez TechStore a été approuvée!', 'CREDIT_APPROVED', FALSE, CURRENT_TIMESTAMP - INTERVAL '48 hours'),
(1, 'Paiement Confirmé', 'Votre paiement de 150 DT pour le versement 1 a été reçu.', 'PAYMENT_CONFIRMED', TRUE, CURRENT_TIMESTAMP - INTERVAL '24 hours'),
(1, 'Versement Crédit N°2 Payé', 'Vous avez payé avec 5 jours de retard (+5 DT pénalité).', 'PAYMENT_CONFIRMED', FALSE, CURRENT_TIMESTAMP - INTERVAL '5 hours');

-- Notifications pour Fatima
INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES
(2, 'Documents KYC Approuvés', 'Vos documents KYC ont été vérifiés et approuvés.', 'KYC_VALIDATED', FALSE, CURRENT_TIMESTAMP - INTERVAL '72 hours'),
(2, 'Crédit Approuvé', 'Votre demande de crédit de 600 DT chez FashionBoutique a été approuvée!', 'CREDIT_APPROVED', FALSE, CURRENT_TIMESTAMP - INTERVAL '60 hours'),
(2, 'Paiement Confirmé', 'Votre paiement de 100 DT pour le versement 1 a été reçu.', 'PAYMENT_CONFIRMED', TRUE, CURRENT_TIMESTAMP - INTERVAL '30 hours'),
(2, 'Rappel de Versement', 'Votre prochain versement de 100 DT est dû dans 10 jours.', 'PAYMENT_REMINDER', FALSE, CURRENT_TIMESTAMP - INTERVAL '1 hour');

-- Notifications pour Mohamed
INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES
(3, 'Documents KYC Approuvés', 'Vos documents KYC ont été vérifiés et approuvés.', 'KYC_VALIDATED', FALSE, CURRENT_TIMESTAMP - INTERVAL '96 hours'),
(3, 'Demande de Crédit en Attente', 'Votre demande de crédit de 500 DT est en cours de traitement.', 'PAYMENT_REMINDER', FALSE, CURRENT_TIMESTAMP - INTERVAL '72 hours');

-- Notifications pour Leila
INSERT INTO notifications (user_id, title, message, type, is_read, created_at) VALUES
(4, 'Demande de Documents KYC', 'Nous sommes en train d''examiner vos documents KYC. Veuillez patienter.', 'PAYMENT_REMINDER', FALSE, CURRENT_TIMESTAMP - INTERVAL '48 hours');

-- ============================================================
-- 10. VISUALISER LES DONNÉES INSÉRÉES
-- ============================================================

/*
-- Utilisateurs
SELECT * FROM users;

-- KYC Documents
SELECT u.email, k.status FROM kyc_documents k JOIN users u ON k.user_id = u.id;

-- Scores de Crédit
SELECT u.email, cs.score, cs.max_credit_amount FROM credit_scores cs JOIN users u ON cs.user_id = u.id;

-- Demandes de Crédit
SELECT u.email, cr.total_amount, cr.status FROM credit_requests cr JOIN users u ON cr.user_id = u.id;

-- Versements
SELECT u.email, i.due_date, i.amount, i.status FROM installments i 
JOIN credit_requests cr ON i.credit_request_id = cr.id 
JOIN users u ON cr.user_id = u.id;

-- Paiements
SELECT u.email, p.amount, p.transaction_reference FROM payments p JOIN users u ON p.user_id = u.id;

-- Notifications
SELECT u.email, n.type, n.is_read FROM notifications n JOIN users u ON n.user_id = u.id;
*/

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
