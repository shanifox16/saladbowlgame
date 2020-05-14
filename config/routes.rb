Rails.application.routes.draw do
  root 'homes#index'
  devise_for :users

  get '/', to: 'homes#index'
  get '/game/:url/form', to: 'homes#index'
  get '/game/:url/scoreboard', to: 'homes#index'
  get '/game/:url/myturn', to: 'homes#index'
  get '/privacypolicy', to: 'homes#index'

  namespace :api do
    namespace :v1 do
      resources :games, only: [:index, :show, :create, :update] do
        resources :entries, only: [:index, :show, :create, :update]
        resources :players, only: [:index, :show, :create]
        resources :notifications, only: [:index, :show]
        resources :rounds, only: [:index, :update]
        resources :teams, only: [:update]
      end
    end
  end
end
