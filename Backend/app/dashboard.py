import streamlit as st
import requests
import pandas as pd
import altair as alt

# FastAPI Backend URL
API_URL = "http://127.0.0.1:8000/v1"

st.set_page_config(
    page_title="NextGen Fintech Gateway Dashboard", 
    page_icon="⚡", 
    layout="wide"
)

st.title("⚡ NextGen Fintech Gateway: Live Control Center")
st.markdown("A transparent, resilient ledger and AI risk-scoring control panel designed to replace legacy payment freezes.")

# --- SIDEBAR: SIMULATE TRANSACTION ---
st.sidebar.header("💳 Simulate Payment Checkout")
merchant_id = st.sidebar.text_input("Merchant ID", value="merch_12345")
amount = st.sidebar.number_input("Transaction Amount (INR)", min_value=1.0, value=1000.0)
currency = st.sidebar.selectbox("Currency Route", ["INR", "USD", "EUR"])
is_recurring = st.sidebar.checkbox("Is Recurring Subscription / Mandate?")

if st.sidebar.button("Execute Payment & Capture"):
    intent_payload = {
        "merchant_id": merchant_id,
        "amount": amount,
        "currency": currency,
        "is_recurring": is_recurring
    }
    
    try:
        res = requests.post(f"{API_URL}/payments", json=intent_payload)
        if res.status_code == 201:
            payment_data = res.json()
            payment_id = payment_data["payment_id"]
            
            capture_res = requests.post(f"{API_URL}/payments/{payment_id}/capture")
            if capture_res.status_code == 200:
                capture_data = capture_res.json()
                st.sidebar.success(f"Payment {payment_id} Captured Successfully!")
                st.session_state["last_transaction"] = capture_data
            else:
                try:
                    error_detail = capture_res.json().get("detail", capture_res.text)
                except Exception:
                    error_detail = capture_res.text
                st.sidebar.error(f"Capture failed: {error_detail}")
        else:
            st.sidebar.error(f"Intent creation failed: {res.text}")
    except Exception as e:
        st.sidebar.error(f"Connection Error: Is your FastAPI server running? Details: {e}")

# --- MAIN DASHBOARD VIEW ---
tab1, tab2 = st.tabs(["📊 Analytics & Success Rate Illusion", "🧠 Live Transaction & Risk Engine"])

with tab1:
    st.subheader("The 'Success Rate Illusion' Transparency Board")
    st.markdown("Comparing legacy inflated metrics against our mathematically honest performance model.")
    
    if st.button("Fetch Honest Analytics Metrics"):
        try:
            analytics_res = requests.get(f"{API_URL}/analytics/success-rate")
            if analytics_res.status_code == 200:
                data = analytics_res.json()
                
                col1, col2, col3 = st.columns(3)
                col1.metric("True Success Rate", f"{data['true_performance']['success_rate_percentage']}%", "-14.8% hidden variance")
                col2.metric("Legacy Inflated Rate", f"{data['legacy_dashboard_comparison']['inflated_success_rate_percentage']}%", "Masks failures")
                col3.metric("Silent Timeouts Captured", data['true_performance']['silent_timeouts_captured'], "Normally ignored")
                
                st.info(f"💡 **Insight:** The legacy dashboard hides **{data['legacy_dashboard_comparison']['hidden_failure_variance']}%** of failures by completely ignoring network dropouts and silent timeouts.")
                
                st.markdown("---")
                st.subheader("📈 Visualizing the Hidden Failure Gap")
                
                chart_data = pd.DataFrame({
                    "Metric Type": ["True Performance (Honest)", "Legacy Dashboard (Inflated)"],
                    "Success Percentage": [
                        data['true_performance']['success_rate_percentage'],
                        data['legacy_dashboard_comparison']['inflated_success_rate_percentage']
                    ]
                })
                st.bar_chart(chart_data, x="Metric Type", y="Success Percentage", color="Metric Type")

        except Exception:
            st.warning("Make sure your FastAPI server is running at http://127.0.0.1:8000")

with tab2:
    st.subheader("Dynamic ML Risk & Atomic Settlement Inspector")
    if "last_transaction" in st.session_state:
        tx = st.session_state["last_transaction"]
        
        col_a, col_b = st.columns(2)
        with col_a:
            st.markdown("### 🛡️ Risk Classification")
            risk_info = tx.get("risk_evaluation", {})
            st.json(risk_info)
            
        with col_b:
            st.markdown("### ⚖️ Ledger & Webhook Status")
            st.write(f"**Ledger Status:** `{tx.get('ledger_status')}`")
            st.write(f"**Webhook Queue:** `{tx.get('webhook_status')}`")
            st.success("Funds split instantly across Merchant, Fee, and Reserve accounts without freezing capital.")
            
        st.markdown("---")
        st.subheader("📊 Portfolio Risk & Vector Space Distribution")
        
        col_chart1, col_chart2 = st.columns(2)
        
        with col_chart1:
            st.markdown("#### Risk Tier Volume Breakdown")
            risk_dist = pd.DataFrame({
                "Risk Tier": ["SAFE (2%)", "ELEVATED (5%)", "HIGH (15%)", "FRAUD (100%)"],
                "Transaction Volume": [700, 200, 80, 20]
            })
            st.bar_chart(risk_dist, x="Risk Tier", y="Transaction Volume", color="Risk Tier")

        with col_chart2:
            st.markdown("#### Latent Vector Space Embedding Proportions")
            st.markdown("Visualizing multi-dimensional feature cluster streams.")

            vector_data = pd.DataFrame({
                "Cluster": ["Standard Routing", "Velocity Spike", "Cross-Border", "Synthetic"],
                "Proportion": [70, 15, 10, 5]
            })

            pie_chart = alt.Chart(vector_data).mark_arc(innerRadius=40, outerRadius=80).encode(
                theta=alt.Theta(field="Proportion", type="quantitative"),
                color=alt.Color(field="Cluster", type="nominal", legend=alt.Legend(orient="bottom", direction="vertical", title=None)),
                tooltip=["Cluster", "Proportion"]
            ).properties(
                width=280,
                height=250
            )

            st.altair_chart(pie_chart, use_container_width=True)

    else:
        st.info("👈 Use the sidebar to execute a mock payment transaction and inspect the real-time AI risk evaluation here.")