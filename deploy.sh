docker build -t scottcollins/fibonacci-client:latest -t scottcollins/fibonacci-client:$GIT_SHA ./client
docker build -t scottcollins/fibonacci-worker:latest -t scottcollins/fibonacci-worker:$GIT_SHA ./worker
docker build -t scottcollins/fibonacci-api:latest -t scottcollins/fibonacci-api:$GIT_SHA ./api

docker push scottcollins/fibonacci-client:latest 
docker push scottcollins/fibonacci-client:$GIT_SHA 
docker push scottcollins/fibonacci-worker:latest
docker push scottcollins/fibonacci-worker:$GIT_SHA
docker push scottcollins/fibonacci-api:latest
docker push scottcollins/fibonacci-api:$GIT_SHA

kubectl apply -f ./kube

kubectl set image deployments/api api=scottcollins/fibonacci-api:$GIT_SHA
kubectl set image deployments/client client=scottcollins/fibonacci-client:$GIT_SHA
kubectl set image deployments/worker worker=scottcollins/fibonacci-worker:$GIT_SHA
