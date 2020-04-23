Rails.application.routes.draw do
  root 'homes#index'
  devise_for :users

  get '/', to: 'homes#index'
  get '/form', to: 'homes#index'
  get '/scoreboard', to: 'homes#index'
  get '/myturn', to: 'homes#index'

  namespace :api do
    namespace :v1 do
      resources :entries, only: [:index, :show, :create, :update]
      resources :teams, only: [:update]
      resources :rounds, only: [:index, :update]
      resources :notifications, only: [:index, :show]
    end
  end
end
