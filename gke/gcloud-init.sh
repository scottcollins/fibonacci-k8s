gcloud config set project fibonacci-k8s-$1
gcloud config set compute/zone us-east1-d
gcloud container clusters get-credentials fibonacci-cluster

kubectl create secret generic passwords --from-literal postgres=postgres_password
kubectl create serviceaccount --namespace kube-system tiller
kubectl create clusterrolebinding tiller-account-binding --clusterrole=cluster-admin --serviceaccount=kube-system:tiller

apt-get update && apt-get install curl

curl https://raw.githubusercontent.com/kubernetes/helm/master/scripts/get > get_helm.sh
chmod +x ./get_helm.sh
./get_helm.sh

helm init --service-account tiller --upgrade


