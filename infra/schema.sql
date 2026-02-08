CREATE TABLE IF NOT EXISTS transactions(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    financial_year VARCHAR(20) DEFAULT '2025-2026',
    --personal
    annualIncome DECIMAL(15,2),
    basicPay DECIMAL(15,2) ,
    hra_received DECIMAL(15,2) ,
    other_income DECIMAL(15,2) ,
    --deductions
    investments_80C DECIMAL(15,2),
    medical_80D DECIMAL(15,2),
    nps_80CCD DECIMAL(15,2),
    education_80E DECIMAL(15,2),
    rent_paid DECIMAL(15,2),
    professional_tax DECIMAL(15,2),
    other_deductions DECIMAL(15,2) ,
    --calculated fields
    standard_deduction DECIMAL(15,2),
    hra_exemption DECIMAL(15,2),
    --final
    calculated_old_tax DECIMAL(15,2),
    calculated_new_tax DECIMAL(15,2),
    final_tax DECIMAL(15,2),
    savings DECIMAL(15,2),
    recommendation VARCHAR(255),
    --creation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    public_id TEXT NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- e.g., 'RENT_RECEIPT', 'MEDICAL_BILL'
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);