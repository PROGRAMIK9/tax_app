# =============================================================================
# FINANCIAL FRAUD DETECTION USING MACHINE LEARNING
# =============================================================================
# Resume Bullet: "Employed an ML model to classify financial data and avoid
#                fraudulent financial activities."
# Libraries Used: pandas, numpy, scikit-learn
# =============================================================================


# =============================================================================
# SECTION 1: IMPORTING LIBRARIES
# =============================================================================
# These are the three core libraries listed on your resume.

import pandas as pd
# pandas: Used for data manipulation and analysis.
# It gives us the DataFrame structure — like an Excel table in Python.
# We use it to load, clean, inspect, and transform our dataset.

import numpy as np
# numpy: Numerical computing library.
# Works with arrays and mathematical operations.
# scikit-learn internally uses numpy arrays, so we use it to handle
# numerical transformations and random seed control.

from sklearn.model_selection import train_test_split
# train_test_split: Splits the dataset into training and testing sets.
# Training set -> model learns from it.
# Testing set  -> we evaluate how well the model performs on unseen data.

from sklearn.preprocessing import StandardScaler
# StandardScaler: Standardizes features by removing the mean and scaling
# to unit variance. Formula: z = (x - mean) / std_deviation
# Why needed? ML models like Logistic Regression are sensitive to feature
# scale. Without scaling, a feature with large values (e.g., transaction
# amount = 10,000) dominates over small ones (e.g., time = 0.5).

from sklearn.ensemble import RandomForestClassifier
# RandomForestClassifier: An ensemble ML algorithm that builds multiple
# decision trees and merges their predictions.
# Perfect for fraud detection because:
# - Handles imbalanced datasets reasonably well
# - Captures complex non-linear patterns
# - Provides feature importance scores
# - Resistant to overfitting compared to a single decision tree

from sklearn.linear_model import LogisticRegression
# LogisticRegression: A classic binary classification algorithm.
# Despite its name, it's a CLASSIFIER not a regressor.
# Outputs the probability of a transaction being fraudulent (0 or 1).
# Great baseline model -- interpretable and fast.

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    accuracy_score
)
# Evaluation metrics -- critical for understanding model performance:
# classification_report -> precision, recall, f1-score per class
# confusion_matrix      -> shows True Positives, False Positives, etc.
# roc_auc_score         -> AUC score (1.0 = perfect, 0.5 = random)
# accuracy_score        -> overall % of correct predictions

from sklearn.utils import resample
# resample: Used to oversample the minority class (fraud cases).
# In real fraud datasets, frauds are rare (~0.1-1%).
# If we don't balance, the model just predicts "not fraud" for everything
# and still gets 99% accuracy -- which is useless!

import warnings
warnings.filterwarnings('ignore')
# Suppresses non-critical warnings that clutter the console output.


# =============================================================================
# SECTION 2: GENERATING A SYNTHETIC FINANCIAL DATASET
# =============================================================================
# In real life, you'd load a CSV:  df = pd.read_csv('transactions.csv')
# Here, we generate realistic fake data so the code runs independently.

def generate_financial_dataset(n_samples=10000, fraud_ratio=0.02, random_state=42):
    """
    Generates a synthetic financial transaction dataset.

    Parameters:
    -----------
    n_samples    : int   -> Total number of transactions to generate
    fraud_ratio  : float -> Fraction of transactions that are fraudulent (2%)
    random_state : int   -> Seed for reproducibility (same results every run)

    Returns:
    --------
    df : pd.DataFrame -> A DataFrame with transaction features and fraud label
    """

    # Set the random seed so results are reproducible
    np.random.seed(random_state)

    n_fraud = int(n_samples * fraud_ratio)       # Number of fraudulent transactions
    n_legit = n_samples - n_fraud                # Number of legitimate transactions

    # --- LEGITIMATE TRANSACTIONS ---
    # These follow "normal" patterns -- small-medium amounts, daytime hours, etc.
    legit = pd.DataFrame({
        'transaction_amount': np.random.exponential(scale=200, size=n_legit),
        # exponential distribution -> most transactions are small, few are large
        # This mimics real spending behavior (lots of $10-$50, few $500+)

        'transaction_hour': np.random.randint(6, 23, size=n_legit),
        # Legitimate users mostly transact during waking hours (6 AM - 10 PM)

        'account_age_days': np.random.randint(180, 3650, size=n_legit),
        # Legit accounts are older (6 months to 10 years)

        'num_transactions_today': np.random.randint(1, 8, size=n_legit),
        # Normal users make 1-7 transactions per day

        'distance_from_home_km': np.random.exponential(scale=30, size=n_legit),
        # Most transactions happen near home

        'is_foreign_transaction': np.random.choice([0, 1], size=n_legit, p=[0.95, 0.05]),
        # Only 5% of legit transactions are foreign

        'card_present': np.random.choice([0, 1], size=n_legit, p=[0.2, 0.8]),
        # 80% of legit transactions are card-present (in-person)

        'failed_attempts_before': np.random.randint(0, 2, size=n_legit),
        # Legit users rarely fail PIN/auth

        'label': 0  # 0 = NOT FRAUD
    })

    # --- FRAUDULENT TRANSACTIONS ---
    # These exhibit suspicious patterns -- large amounts, odd hours, new accounts, etc.
    fraud = pd.DataFrame({
        'transaction_amount': np.random.exponential(scale=1200, size=n_fraud),
        # Fraudsters attempt large amounts

        'transaction_hour': np.random.choice(
            list(range(0, 5)) + list(range(22, 24)), size=n_fraud
        ),
        # Fraudsters operate at night / odd hours (midnight - 5 AM, 10 PM - midnight)

        'account_age_days': np.random.randint(1, 90, size=n_fraud),
        # Fraudulent accounts are typically new (less than 3 months)

        'num_transactions_today': np.random.randint(8, 30, size=n_fraud),
        # Fraudsters make many rapid transactions in a short window

        'distance_from_home_km': np.random.exponential(scale=300, size=n_fraud),
        # Transactions are far from home (stolen card used elsewhere)

        'is_foreign_transaction': np.random.choice([0, 1], size=n_fraud, p=[0.4, 0.6]),
        # 60% of fraud transactions are foreign

        'card_present': np.random.choice([0, 1], size=n_fraud, p=[0.8, 0.2]),
        # 80% of fraud is card-NOT-present (online, where CVV is guessed)

        'failed_attempts_before': np.random.randint(1, 6, size=n_fraud),
        # Fraudsters often fail authentication multiple times

        'label': 1  # 1 = FRAUD
    })

    # Combine both DataFrames into one, then shuffle randomly
    df = pd.concat([legit, fraud], ignore_index=True)
    # pd.concat joins two DataFrames vertically (stacks rows)
    # ignore_index=True resets row numbers from 0 to n_samples-1

    df = df.sample(frac=1, random_state=random_state).reset_index(drop=True)
    # .sample(frac=1) -> shuffles all rows randomly
    # .reset_index(drop=True) -> resets row index after shuffle

    return df


# =============================================================================
# SECTION 3: EXPLORATORY DATA ANALYSIS (EDA)
# =============================================================================

def perform_eda(df):
    """
    Prints a summary of the dataset to understand its structure,
    class balance, and basic statistics.

    Parameters:
    -----------
    df : pd.DataFrame -> The full transaction dataset
    """

    print("=" * 65)
    print("  EXPLORATORY DATA ANALYSIS (EDA)")
    print("=" * 65)

    print(f"\n[1] Dataset Shape: {df.shape}")
    # .shape returns (rows, columns) -- tells us dataset size

    print(f"\n[2] Column Names:\n{df.columns.tolist()}")
    # .columns gives all feature names; .tolist() converts to a Python list

    print(f"\n[3] Data Types:\n{df.dtypes}")
    # .dtypes shows each column's data type (int64, float64, object, etc.)
    # Important to catch non-numeric columns before feeding to ML models

    print(f"\n[4] Missing Values:\n{df.isnull().sum()}")
    # .isnull() returns True/False for each cell
    # .sum() counts the True values per column (i.e., count of nulls)
    # Missing values must be handled before training

    print(f"\n[5] Basic Statistics:")
    print(df.describe().round(2))
    # .describe() shows count, mean, std, min, 25%, 50%, 75%, max
    # Helps spot outliers or strange distributions

    print(f"\n[6] Class Distribution (label column):")
    label_counts = df['label'].value_counts()
    print(label_counts)
    print(f"\n    -> Fraud Rate: {label_counts[1] / len(df) * 100:.2f}%")
    # value_counts() shows how many 0s and 1s exist
    # Fraud rate shows class imbalance -- critical to address!


# =============================================================================
# SECTION 4: DATA PREPROCESSING
# =============================================================================

def preprocess_data(df):
    """
    Prepares the raw dataset for machine learning:
    1. Separates features (X) from target label (y)
    2. Handles class imbalance using oversampling
    3. Splits data into train/test sets
    4. Scales features using StandardScaler

    Parameters:
    -----------
    df : pd.DataFrame -> Raw dataset

    Returns:
    --------
    X_train_scaled, X_test_scaled : Scaled feature arrays for training/testing
    y_train, y_test               : Labels for training/testing
    scaler                        : Fitted StandardScaler (to reuse on new data)
    feature_names                 : List of feature column names
    """

    print("\n" + "=" * 65)
    print("  DATA PREPROCESSING")
    print("=" * 65)

    # --- Step 4.1: Separate Features and Target ---
    feature_names = [col for col in df.columns if col != 'label']
    # List comprehension: picks all columns except 'label'
    # These are the INPUT features the model will learn from

    X = df[feature_names]
    # X = Feature matrix (all input columns)
    # Shape: (n_samples, n_features) -- e.g., (10000, 8)

    y = df['label']
    # y = Target vector (what we're predicting: 0 = legit, 1 = fraud)
    # Shape: (n_samples,) -- e.g., (10000,)

    print(f"\n[1] Features (X) shape: {X.shape}")
    print(f"    Target  (y) shape: {y.shape}")
    print(f"    Feature names: {feature_names}")

    # --- Step 4.2: Handle Class Imbalance ---
    # Problem: With 2% fraud, a model that always predicts "not fraud"
    # gets 98% accuracy but catches ZERO actual frauds -- useless!
    # Solution: Oversample the minority class (fraud) to balance classes.

    print(f"\n[2] Handling Class Imbalance via Oversampling...")

    # Combine X and y temporarily to resample together
    df_balanced = pd.concat([X, y], axis=1)
    # axis=1 -> joins columns side by side (horizontal concat)

    df_majority = df_balanced[df_balanced['label'] == 0]  # Legitimate
    df_minority = df_balanced[df_balanced['label'] == 1]  # Fraud

    print(f"    Before balancing -> Legit: {len(df_majority)}, Fraud: {len(df_minority)}")

    # Upsample fraud cases to match the count of legitimate transactions
    df_minority_upsampled = resample(
        df_minority,
        replace=True,               # Sample WITH replacement (bootstrap)
        n_samples=len(df_majority), # Match majority class count
        random_state=42             # Reproducibility
    )
    # resample randomly duplicates rows from the minority class
    # until both classes have the same count

    df_balanced = pd.concat([df_majority, df_minority_upsampled])
    # Combine majority class + upsampled minority class

    df_balanced = df_balanced.sample(frac=1, random_state=42).reset_index(drop=True)
    # Shuffle again so fraud and legit rows are mixed (not all fraud at end)

    X = df_balanced[feature_names]
    y = df_balanced['label']
    print(f"    After balancing  -> Legit: {(y==0).sum()}, Fraud: {(y==1).sum()}")

    # --- Step 4.3: Train-Test Split ---
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.2,       # 20% of data goes to testing
        random_state=42,     # Reproducibility
        stratify=y           # Preserve class ratio in both splits
    )
    # test_size=0.2 -> 80% train, 20% test
    # stratify=y    -> ensures both splits have equal fraud/legit ratio
    #                 (important for balanced evaluation)

    print(f"\n[3] Train-Test Split:")
    print(f"    Training samples  : {X_train.shape[0]}")
    print(f"    Testing samples   : {X_test.shape[0]}")

    # --- Step 4.4: Feature Scaling ---
    scaler = StandardScaler()
    # Creates a StandardScaler object -- not yet fitted

    X_train_scaled = scaler.fit_transform(X_train)
    # .fit()       -> calculates mean and std from TRAINING data
    # .transform() -> applies z = (x - mean) / std to every value
    # Combined: .fit_transform() does both in one step
    # IMPORTANT: We only fit on training data to prevent "data leakage"
    # (the model shouldn't know test data statistics during training)

    X_test_scaled = scaler.transform(X_test)
    # .transform() only (no fitting!) -> uses SAME mean/std from training
    # This simulates the real scenario: new data is scaled using learned stats

    print(f"\n[4] Feature Scaling applied (StandardScaler)")
    print(f"    Example -- 'transaction_amount' mean: {scaler.mean_[0]:.2f}, std: {scaler.scale_[0]:.2f}")

    return X_train_scaled, X_test_scaled, y_train, y_test, scaler, feature_names


# =============================================================================
# SECTION 5: MODEL TRAINING
# =============================================================================

def train_models(X_train, y_train):
    """
    Trains two ML classification models:
    1. Logistic Regression (baseline model -- simple, interpretable)
    2. Random Forest Classifier (advanced model -- powerful, accurate)

    Parameters:
    -----------
    X_train : np.array -> Scaled training features
    y_train : pd.Series -> Training labels (0 or 1)

    Returns:
    --------
    models : dict -> Dictionary of trained model objects
    """

    print("\n" + "=" * 65)
    print("  MODEL TRAINING")
    print("=" * 65)

    models = {}

    # --- Model 1: Logistic Regression ---
    print("\n[1] Training Logistic Regression...")
    lr_model = LogisticRegression(
        max_iter=1000,      # Maximum iterations for the solver to converge
                            # Increase if you see "ConvergenceWarning"
        random_state=42,    # Reproducibility
        class_weight='balanced'
        # 'balanced' automatically adjusts weights inversely proportional
        # to class frequencies -- another way to handle imbalance
    )
    lr_model.fit(X_train, y_train)
    # .fit() = the actual training step
    # The model finds the best decision boundary (a line/plane in feature space)
    # that separates fraud from legitimate transactions

    models['Logistic Regression'] = lr_model
    print("    Logistic Regression trained successfully")

    # --- Model 2: Random Forest Classifier ---
    print("\n[2] Training Random Forest Classifier...")
    rf_model = RandomForestClassifier(
        n_estimators=100,       # Number of decision trees in the forest
                                # More trees = more stable, but slower training
        max_depth=10,           # Maximum depth of each tree
                                # Limits complexity, prevents overfitting
        min_samples_split=5,    # Min samples required to split an internal node
                                # Prevents overly specific rules
        min_samples_leaf=2,     # Min samples required at each leaf (end) node
        class_weight='balanced',# Same as above -- handles imbalance
        random_state=42,        # Reproducibility
        n_jobs=-1               # Use ALL available CPU cores for speed
    )
    rf_model.fit(X_train, y_train)
    # Random Forest builds 100 trees, each:
    # 1. Trained on a random bootstrap sample of training data
    # 2. Splits nodes on a random subset of features
    # Final prediction = majority vote of all 100 trees

    models['Random Forest'] = rf_model
    print("    Random Forest trained successfully")

    return models


# =============================================================================
# SECTION 6: MODEL EVALUATION
# =============================================================================

def evaluate_models(models, X_test, y_test):
    """
    Evaluates each trained model on the held-out test set.
    Prints multiple metrics to fully understand model performance.

    Parameters:
    -----------
    models : dict     -> Dictionary of trained model objects
    X_test : np.array -> Scaled test features
    y_test : pd.Series -> True test labels
    """

    print("\n" + "=" * 65)
    print("  MODEL EVALUATION")
    print("=" * 65)

    results = {}

    for name, model in models.items():
        print(f"\n{'=':=<55}")
        print(f"  Model: {name}")
        print(f"{'=':=<55}")

        # --- Generate Predictions ---
        y_pred = model.predict(X_test)
        # .predict() -> hard predictions (0 or 1) for each test sample

        y_prob = model.predict_proba(X_test)[:, 1]
        # .predict_proba() -> probability of EACH class [P(class=0), P(class=1)]
        # [:, 1] -> we only need P(fraud=1) column
        # Used to compute AUC-ROC score

        # --- Accuracy ---
        acc = accuracy_score(y_test, y_pred)
        print(f"\n  Accuracy       : {acc:.4f} ({acc*100:.2f}%)")
        # Accuracy = (correct predictions) / (total predictions)
        # WARNING: Misleading for imbalanced data -- always check recall too!

        # --- ROC-AUC Score ---
        auc = roc_auc_score(y_test, y_prob)
        print(f"  ROC-AUC Score  : {auc:.4f}")
        # AUC = Area Under the ROC Curve
        # ROC plots True Positive Rate vs False Positive Rate at various thresholds
        # AUC = 1.0 -> perfect model | AUC = 0.5 -> random guessing
        # For fraud detection, AUC > 0.90 is generally considered good

        # --- Confusion Matrix ---
        cm = confusion_matrix(y_test, y_pred)
        print(f"\n  Confusion Matrix:")
        print(f"                     Predicted NOT FRAUD    Predicted FRAUD")
        print(f"  Actual NOT FRAUD        {cm[0][0]:<20}  {cm[0][1]}")
        print(f"  Actual FRAUD            {cm[1][0]:<20}  {cm[1][1]}")
        print(f"\n  Interpreting:")
        print(f"  -> True Negatives  (TN): {cm[0][0]}  (Legit correctly identified)")
        print(f"  -> False Positives (FP): {cm[0][1]}  (Legit wrongly flagged as fraud)")
        print(f"  -> False Negatives (FN): {cm[1][0]}  (Fraud missed -- DANGEROUS!)")
        print(f"  -> True Positives  (TP): {cm[1][1]}  (Fraud correctly caught)")
        # For fraud detection, MINIMIZING False Negatives is crucial
        # A missed fraud (FN) costs far more than a false alarm (FP)

        # --- Classification Report ---
        print(f"\n  Classification Report:")
        print(classification_report(y_test, y_pred, target_names=['Legit', 'Fraud']))
        # Shows per-class:
        # Precision = TP / (TP + FP)  -> Of all flagged frauds, how many are real?
        # Recall    = TP / (TP + FN)  -> Of all real frauds, how many did we catch?
        # F1-Score  = harmonic mean of precision and recall
        # Support   = number of actual samples in each class

        results[name] = {'accuracy': acc, 'auc': auc}

    return results


# =============================================================================
# SECTION 7: FEATURE IMPORTANCE
# =============================================================================

def show_feature_importance(rf_model, feature_names):
    """
    Displays which features contributed most to the Random Forest's decisions.
    Feature importance helps explain WHY the model flags a transaction as fraud.

    Parameters:
    -----------
    rf_model      : RandomForestClassifier -> Trained Random Forest model
    feature_names : list                   -> Names of all input features
    """

    print("\n" + "=" * 65)
    print("  FEATURE IMPORTANCE (Random Forest)")
    print("=" * 65)

    importances = rf_model.feature_importances_
    # .feature_importances_ -> array of importance scores (sum = 1.0)
    # Calculated as mean decrease in "impurity" (Gini impurity)
    # across all trees and all splits using that feature

    # Create a sorted DataFrame for easy reading
    importance_df = pd.DataFrame({
        'Feature'   : feature_names,
        'Importance': importances
    }).sort_values('Importance', ascending=False)
    # sort_values sorts rows by importance score, highest first

    print("\n  Feature Importances (higher = more influential):\n")
    for _, row in importance_df.iterrows():
        bar = '#' * int(row['Importance'] * 50)  # Visual bar chart
        print(f"  {row['Feature']:<30} {row['Importance']:.4f}  {bar}")


# =============================================================================
# SECTION 8: PREDICTING ON NEW TRANSACTIONS
# =============================================================================

def predict_new_transaction(model, scaler, feature_names):
    """
    Demonstrates how to use the trained model on new, unseen transactions.
    This is what would happen in a real production system.

    Parameters:
    -----------
    model         : trained ML model (RandomForestClassifier)
    scaler        : fitted StandardScaler
    feature_names : list of feature names (must match training order)
    """

    print("\n" + "=" * 65)
    print("  PREDICTING ON NEW TRANSACTIONS")
    print("=" * 65)

    # --- Transaction 1: Suspicious ---
    suspicious_transaction = {
        'transaction_amount'      : 4500.00,  # Very large amount
        'transaction_hour'        : 2,        # 2 AM -- odd hour
        'account_age_days'        : 15,       # Very new account
        'num_transactions_today'  : 22,       # Unusually high frequency
        'distance_from_home_km'   : 850.0,    # Very far from home
        'is_foreign_transaction'  : 1,        # Foreign transaction
        'card_present'            : 0,        # Card NOT present (online)
        'failed_attempts_before'  : 3,        # Multiple failed auth attempts
    }

    # --- Transaction 2: Normal ---
    normal_transaction = {
        'transaction_amount'      : 45.00,    # Small, everyday amount
        'transaction_hour'        : 14,       # 2 PM -- normal hour
        'account_age_days'        : 730,      # 2-year-old account
        'num_transactions_today'  : 2,        # Typical daily count
        'distance_from_home_km'   : 5.0,      # Close to home
        'is_foreign_transaction'  : 0,        # Domestic
        'card_present'            : 1,        # Physical card used
        'failed_attempts_before'  : 0,        # No failed attempts
    }

    for label, txn in [("SUSPICIOUS TRANSACTION", suspicious_transaction),
                        ("NORMAL TRANSACTION", normal_transaction)]:

        print(f"\n  {'*'*50}")
        print(f"  Testing: {label}")
        print(f"  {'*'*50}")

        # Convert the dictionary to a DataFrame (model expects 2D input)
        txn_df = pd.DataFrame([txn], columns=feature_names)
        # pd.DataFrame([txn]) creates a 1-row DataFrame
        # columns=feature_names ensures column ORDER matches training

        # Scale using the SAME scaler fitted during training
        txn_scaled = scaler.transform(txn_df)
        # Transform but NOT fit -- we use the training distribution

        # Predict
        prediction = model.predict(txn_scaled)[0]
        # .predict() returns array; [0] gets the single value (0 or 1)

        probability = model.predict_proba(txn_scaled)[0][1]
        # [0][1] -> first (only) sample, probability of class 1 (fraud)

        result = "!!! FRAUD DETECTED !!!" if prediction == 1 else ">>> LEGITIMATE <<<"
        print(f"\n  Prediction       : {result}")
        print(f"  Fraud Probability: {probability*100:.1f}%")
        print(f"  Transaction Data : {txn}")


# =============================================================================
# SECTION 9: MAIN PIPELINE -- TIES EVERYTHING TOGETHER
# =============================================================================

def main():
    """
    Main function that orchestrates the entire ML pipeline:
    1. Generate data
    2. Explore data (EDA)
    3. Preprocess (split, scale, balance)
    4. Train models
    5. Evaluate models
    6. Show feature importance
    7. Predict on new data

    In a real project, Step 1 would be replaced by loading a real CSV file.
    """

    print("\n" + "=" * 65)
    print("  FINANCIAL FRAUD DETECTION -- ML PIPELINE")
    print("=" * 65)

    # Step 1: Generate synthetic dataset
    print("\n[STEP 1] Generating synthetic financial transaction data...")
    df = generate_financial_dataset(n_samples=10000, fraud_ratio=0.02)
    print(f"  Dataset created: {df.shape[0]:,} transactions")

    # Step 2: Exploratory Data Analysis
    print("\n[STEP 2] Running Exploratory Data Analysis...")
    perform_eda(df)

    # Step 3: Preprocessing
    print("\n[STEP 3] Preprocessing data...")
    X_train, X_test, y_train, y_test, scaler, feature_names = preprocess_data(df)

    # Step 4: Train models
    print("\n[STEP 4] Training ML models...")
    models = train_models(X_train, y_train)

    # Step 5: Evaluate models
    print("\n[STEP 5] Evaluating models on test data...")
    results = evaluate_models(models, X_test, y_test)

    # Step 6: Feature importance (Random Forest only)
    print("\n[STEP 6] Analyzing feature importance...")
    show_feature_importance(models['Random Forest'], feature_names)

    # Step 7: Predict on new transactions
    print("\n[STEP 7] Predicting on new transactions...")
    predict_new_transaction(models['Random Forest'], scaler, feature_names)

    # Final summary
    print("\n" + "=" * 65)
    print("  PIPELINE COMPLETE -- FINAL MODEL SUMMARY")
    print("=" * 65)
    for model_name, metrics in results.items():
        print(f"\n  {model_name}:")
        print(f"    Accuracy  : {metrics['accuracy']*100:.2f}%")
        print(f"    AUC Score : {metrics['auc']:.4f}")

    print("\n" + "=" * 65)
    print("  WHAT EACH LIBRARY DID (for your resume)")
    print("=" * 65)
    print("""
  pandas:
    - pd.DataFrame()       -> Structured the dataset (rows = transactions)
    - pd.concat()          -> Merged legit + fraud DataFrames
    - df.describe()        -> Explored statistics of each feature
    - df.isnull().sum()    -> Checked for missing values
    - df.sample()          -> Shuffled the dataset randomly

  numpy:
    - np.random.seed()     -> Set seed for reproducibility
    - np.random.exponential() -> Generated realistic transaction amounts
    - np.random.randint()  -> Generated integer features (hours, age, etc.)
    - np.random.choice()   -> Generated binary feature values (0/1)

  scikit-learn:
    - train_test_split     -> Split data 80% train, 20% test
    - StandardScaler       -> Normalized features (zero mean, unit variance)
    - LogisticRegression   -> Baseline binary classifier
    - RandomForestClassifier -> Main fraud detection model (ensemble of trees)
    - resample             -> Oversampled minority (fraud) class
    - accuracy_score       -> Measured overall correctness
    - roc_auc_score        -> Measured ranking ability (fraud vs legit)
    - confusion_matrix     -> Showed TP, FP, TN, FN breakdown
    - classification_report-> Showed precision, recall, F1 per class
    """)


# =============================================================================
# ENTRY POINT
# =============================================================================
if __name__ == "__main__":
    # This block only runs when you execute this file directly:
    #   python fraud_detection_model.py
    # It does NOT run when this file is imported as a module elsewhere.
    main()